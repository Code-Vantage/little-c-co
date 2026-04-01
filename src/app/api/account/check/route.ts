import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

export async function POST(request: Request) {
  let payload: { email?: string };

  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const matches = await wooRequest<any[]>(
      `/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    );

    if (matches && matches.length > 0) {
      return Response.json({ exists: true });
    }

    return Response.json({ exists: false });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to check email" },
      { status: 500 },
    );
  }
}
