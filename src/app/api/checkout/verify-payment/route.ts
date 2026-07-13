import { isWooConfigured, wooRequest } from "@/lib/woocommerce";
import { isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/razorpay";

type VerifyPayload = {
  wooOrderId?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
};

export async function POST(request: Request) {
  let payload: VerifyPayload;

  try {
    payload = (await request.json()) as VerifyPayload;
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { wooOrderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = payload;

  if (!wooOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return Response.json({ error: "Missing payment verification fields" }, { status: 400 });
  }

  if (!isWooConfigured() || !isRazorpayConfigured()) {
    return Response.json({ error: "Payments are not configured" }, { status: 503 });
  }

  const isValid = verifyRazorpaySignature({
    orderId: razorpayOrderId,
    paymentId: razorpayPaymentId,
    signature: razorpaySignature,
  });

  if (!isValid) {
    return Response.json({ error: "Payment signature verification failed" }, { status: 400 });
  }

  try {
    // Mark the order paid and record the Razorpay payment id for reconciliation.
    const order = await wooRequest<{ id: number; order_key?: string }>(
      `/wp-json/wc/v3/orders/${wooOrderId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          status: "processing",
          set_paid: true,
          transaction_id: razorpayPaymentId,
          meta_data: [
            { key: "_razorpay_order_id", value: razorpayOrderId },
            { key: "_razorpay_payment_id", value: razorpayPaymentId },
          ],
        }),
      },
    );

    return Response.json({ success: true, orderId: order.id, orderKey: order.order_key });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to confirm order",
      },
      { status: 500 },
    );
  }
}
