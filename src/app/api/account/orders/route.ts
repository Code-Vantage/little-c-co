import { getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

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
    const orders = await wooRequest<Array<{ id: number; status: string; date_created: string; total: string }>>(
      `/wp-json/wc/v3/orders?customer=${encodeURIComponent(customerId)}`,
    );
    return Response.json(orders);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch orders",
      },
      { status: 500 },
    );
  }
}
