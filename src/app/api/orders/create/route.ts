import { getCustomerIdFromRequest } from "@/lib/customer-session";
import type { CheckoutPayload } from "@/lib/types";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";
import { createCustomerSessionCookie } from "@/lib/customer-session";

export async function POST(request: Request) {
  let payload: CheckoutPayload;

  try {
    payload = (await request.json()) as CheckoutPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload.line_items || payload.line_items.length === 0) {
    return Response.json({ error: "Cart cannot be empty" }, { status: 400 });
  }

  if (!isWooConfigured()) {
    return Response.json(
      {
        error:
          "WooCommerce credentials are missing. Set WOOCOMMERCE_SITE_URL, WOOCOMMERCE_CONSUMER_KEY, and WOOCOMMERCE_CONSUMER_SECRET.",
      },
      { status: 503 },
    );
  }

  try {
    const sessionCustomerId = getCustomerIdFromRequest(request);
    const parsedSessionCustomerId = sessionCustomerId ? Number(sessionCustomerId) : undefined;
    const resolvedCustomerId = Number.isFinite(parsedSessionCustomerId)
      ? parsedSessionCustomerId
      : undefined;

    const order = await wooRequest<{ id: number; status: string }>("/wp-json/wc/v3/orders", {
      method: "POST",
      body: JSON.stringify({
        payment_method: "woocommerce_payments",
        payment_method_title: "WooCommerce Payments",
        set_paid: false,
        billing: payload.billing,
        shipping: payload.shipping,
        line_items: payload.line_items,
        ...(resolvedCustomerId ? { customer_id: resolvedCustomerId } : {}),
      }),
    });

    const response = Response.json({ id: order.id, status: order.status });

    if (resolvedCustomerId) {
      response.headers.append("Set-Cookie", createCustomerSessionCookie(resolvedCustomerId));
    }

    return response;
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Order creation failed",
      },
      { status: 500 },
    );
  }
}
