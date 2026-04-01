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
    const profile = await wooRequest<{ id: number; first_name: string; last_name: string; email: string }>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
    );
    return Response.json(profile);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId") ?? getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const payload = await request.json();
    const profile = await wooRequest<{ id: number; first_name: string; last_name: string; email: string }>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          first_name: payload.first_name,
          last_name: payload.last_name,
          email: payload.email,
        }),
      },
    );
    return Response.json(profile);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
