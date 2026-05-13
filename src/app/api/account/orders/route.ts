import { getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

type WooOrderSummary = {
  id: number;
  status: string;
  date_created: string;
  total: string;
  customer_id?: number;
  billing?: {
    email?: string;
  };
};

type WooCustomer = {
  id: number;
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function dedupeOrders(orders: WooOrderSummary[]) {
  const byId = new Map<number, WooOrderSummary>();

  for (const order of orders) {
    byId.set(order.id, order);
  }

  return Array.from(byId.values()).sort((a, b) =>
    b.date_created.localeCompare(a.date_created),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId") ?? getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const customer = await wooRequest<WooCustomer>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
    );

    const customerOrders = await wooRequest<WooOrderSummary[]>(
      `/wp-json/wc/v3/orders?customer=${encodeURIComponent(customerId)}`,
    );

    const customerEmail = normalizeEmail(customer.email || "");
    if (!customerEmail) {
      return Response.json(customerOrders);
    }

    const emailMatchedOrders = await wooRequest<WooOrderSummary[]>(
      `/wp-json/wc/v3/orders?search=${encodeURIComponent(customerEmail)}&per_page=100`,
    );

    const visibleOrders = emailMatchedOrders.filter((order) => {
      const billingEmail = normalizeEmail(order.billing?.email || "");
      return billingEmail === customerEmail;
    });

    return Response.json(dedupeOrders([...customerOrders, ...visibleOrders]));
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}
