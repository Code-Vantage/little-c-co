import { wooRequest } from "@/lib/woocommerce";

type WooOrder = {
  id: number;
  customer_id: number;
  billing?: {
    email?: string;
  };
};

const MAX_ORDER_LOOKUP = 100;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Links historical guest orders to an authenticated customer account by exact billing email match.
export async function linkGuestOrdersToCustomer(customerId: number, email: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const candidateOrders = await wooRequest<WooOrder[]>(
    `/wp-json/wc/v3/orders?search=${encodeURIComponent(normalizedEmail)}&per_page=${MAX_ORDER_LOOKUP}`,
  );

  const guestOrderIds = candidateOrders
    .filter((order) => {
      const orderEmail = normalizeEmail(order.billing?.email || "");
      const hasCustomer = Number(order.customer_id) > 0;
      return !hasCustomer && orderEmail === normalizedEmail;
    })
    .map((order) => order.id);

  for (const orderId of guestOrderIds) {
    await wooRequest(`/wp-json/wc/v3/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify({ customer_id: customerId }),
    });
  }
}
