import { getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";
import { getProducts } from "@/lib/products";
import { getPricingRule, resolveLineTotal } from "@/lib/pricing";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import type { Address } from "@/lib/types";

type CheckoutLineItem = {
  product_id?: number;
  quantity?: number;
  set_pieces?: number;
  line_total?: number;
  customizations?: Array<{ key?: string; value?: string }>;
};

type CheckoutPayload = {
  items?: CheckoutLineItem[];
  billing?: Partial<Address>;
  shipping?: Partial<Address>;
  shippingSameAsBilling?: boolean;
};

const MAX_META_VALUE_LENGTH = 2000;
const REQUIRED_ADDRESS_FIELDS: Array<keyof Address> = [
  "first_name",
  "last_name",
  "address_1",
  "city",
  "state",
  "postcode",
  "country",
];

type NormalizedLine = {
  productId: number;
  quantity: number;
  setPieces: number | null;
  clientLineTotal: number | null;
  meta: Array<{ key: string; value: string }>;
};

function normalizeCartItems(items: CheckoutPayload["items"]): NormalizedLine[] {
  return (items ?? [])
    .map((item) => ({
      productId: Number(item.product_id),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
      setPieces:
        Number.isFinite(Number(item.set_pieces)) && Number(item.set_pieces) > 0
          ? Math.floor(Number(item.set_pieces))
          : null,
      clientLineTotal:
        Number.isFinite(Number(item.line_total)) && Number(item.line_total) > 0
          ? Number(item.line_total)
          : null,
      meta: (item.customizations ?? [])
        .map((c) => ({
          key: String(c.key ?? "").trim(),
          value: String(c.value ?? "")
            .trim()
            .slice(0, MAX_META_VALUE_LENGTH),
        }))
        .filter((c) => c.key && c.value),
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0);
}

function normalizeAddress(input: Partial<Address> | undefined): Address {
  const get = (key: keyof Address) => String(input?.[key] ?? "").trim();
  return {
    first_name: get("first_name"),
    last_name: get("last_name"),
    company: get("company"),
    address_1: get("address_1"),
    address_2: get("address_2"),
    city: get("city"),
    state: get("state"),
    postcode: get("postcode"),
    country: get("country"),
    email: get("email"),
    phone: get("phone"),
  };
}

function missingFields(address: Address): string[] {
  return REQUIRED_ADDRESS_FIELDS.filter((field) => !address[field]);
}

type WooOrder = {
  id: number;
  order_key?: string;
  total: string;
  currency: string;
};

export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const items = normalizeCartItems(payload.items);
  if (items.length === 0) {
    return Response.json({ error: "Cart cannot be empty" }, { status: 400 });
  }

  const billing = normalizeAddress(payload.billing);
  if (!billing.email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }
  const billingIssues = missingFields(billing);
  if (billingIssues.length > 0) {
    return Response.json(
      { error: `Missing billing fields: ${billingIssues.join(", ")}` },
      { status: 400 },
    );
  }

  const shipping = payload.shippingSameAsBilling
    ? billing
    : normalizeAddress(payload.shipping);
  const shippingIssues = missingFields(shipping);
  if (shippingIssues.length > 0) {
    return Response.json(
      { error: `Missing shipping fields: ${shippingIssues.join(", ")}` },
      { status: 400 },
    );
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }
  if (!isRazorpayConfigured()) {
    return Response.json({ error: "Payments are not configured yet" }, { status: 503 });
  }

  try {
    const customerId = getCustomerIdFromRequest(request);
    const paymentMethod = process.env.WOOCOMMERCE_PAYMENT_METHOD?.trim() || "razorpay";
    const paymentMethodTitle = process.env.WOOCOMMERCE_PAYMENT_METHOD_TITLE?.trim() || "Razorpay";

    // Resolve authoritative line pricing (Little C Co. tier / set pricing from
    // lib/pricing.ts) so the amount charged always equals what the storefront
    // displayed. Products without a pricing rule fall back to WooCommerce's own
    // product price (no subtotal/total override sent).
    const catalogue = await getProducts();
    const slugById = new Map(catalogue.map((p) => [p.id, p.slug]));

    const lineItems = items.map((item) => {
      const slug = slugById.get(item.productId);
      const rule = getPricingRule(slug);
      let lineTotal = resolveLineTotal({
        slug,
        quantity: item.quantity,
        setPieces: item.setPieces,
      });
      // Rule exists but couldn't be resolved server-side (e.g. missing set
      // size) — trust the client's displayed total rather than silently
      // charging the Woo base price.
      if (lineTotal === null && rule) {
        lineTotal = item.clientLineTotal;
      }
      return {
        product_id: item.productId,
        quantity: item.quantity,
        meta_data: item.meta.map((m) => ({ key: m.key, value: m.value })),
        ...(lineTotal !== null
          ? { subtotal: lineTotal.toFixed(2), total: lineTotal.toFixed(2) }
          : {}),
      };
    });

    // Create a pending Woo order carrying billing/shipping and each line's
    // customizations as line-item meta, so the client sees exactly what to
    // make (and where to ship it) in wp-admin.
    const order = await wooRequest<WooOrder>("/wp-json/wc/v3/orders", {
      method: "POST",
      body: JSON.stringify({
        status: "pending",
        customer_id: customerId ? Number(customerId) : undefined,
        payment_method: paymentMethod,
        payment_method_title: paymentMethodTitle,
        billing,
        shipping,
        line_items: lineItems,
      }),
    });

    // Razorpay expects the amount in the smallest currency unit (paise for INR).
    const amountInPaise = Math.round(Number(order.total) * 100);
    if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
      throw new Error("Order total is invalid.");
    }

    const razorpay = getRazorpayClient();
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: order.currency || "INR",
      receipt: `woo_order_${order.id}`,
      notes: { woo_order_id: String(order.id) },
    });

    return Response.json({
      wooOrderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      customerName: `${billing.first_name} ${billing.last_name}`.trim(),
      customerEmail: billing.email,
      customerPhone: billing.phone,
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to create checkout",
      },
      { status: 500 },
    );
  }
}
