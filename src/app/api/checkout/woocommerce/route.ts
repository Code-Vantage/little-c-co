import { getWooSiteUrl } from "@/lib/woocommerce";

type WooCheckoutPayload = {
  items?: Array<{
    product_id?: number;
    quantity?: number;
  }>;
};

function normalizeCartItems(items: WooCheckoutPayload["items"]) {
  return (items ?? [])
    .map((item) => ({
      productId: Number(item.product_id),
      quantity: Math.max(1, Math.floor(Number(item.quantity) || 1)),
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0);
}

export async function POST(request: Request) {
  let payload: WooCheckoutPayload;

  try {
    payload = (await request.json()) as WooCheckoutPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const items = normalizeCartItems(payload.items);
  if (items.length === 0) {
    return Response.json({ error: "Cart cannot be empty" }, { status: 400 });
  }

  try {
    const checkoutUrl = new URL("/checkout-link/", getWooSiteUrl());
    checkoutUrl.searchParams.set(
      "products",
      items.map((item) => `${item.productId}:${item.quantity}`).join(","),
    );

    return Response.json({ checkoutUrl: checkoutUrl.toString() });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to create checkout URL",
      },
      { status: 500 },
    );
  }
}
