"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { cartLineInfo } from "@/lib/pricing";
import type { Address } from "@/lib/types";
import { AddressForm, addressMissingFields, emptyAddress } from "@/components/address-form";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  handler: (response: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => void;
  modal?: { ondismiss?: () => void };
};

function formatPrice(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN")}`;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type Step = "details" | "payment";
type PaymentState = "idle" | "creating" | "awaiting-payment" | "verifying" | "failed";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("details");
  const [billing, setBilling] = useState<Address>(emptyAddress());
  const [shipping, setShipping] = useState<Address>(emptyAddress());
  const [shippingSameAsBilling, setShippingSameAsBilling] = useState(true);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + cartLineInfo(item).lineTotal, 0),
    [items],
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefill from the logged-in customer's saved profile, if any.
  useEffect(() => {
    async function prefill() {
      try {
        const response = await fetch("/api/account/profile");
        if (response.status === 401) return;
        const profile = (await response.json()) as {
          email?: string;
          billing?: Partial<Address>;
          shipping?: Partial<Address>;
        };
        if (profile.billing) {
          setBilling((prev) => ({
            ...prev,
            ...profile.billing,
            email: profile.billing?.email || profile.email || prev.email,
            country: profile.billing?.country || prev.country,
          }));
        }
        if (profile.shipping && Object.values(profile.shipping).some(Boolean)) {
          setShipping((prev) => ({ ...prev, ...profile.shipping }));
          setShippingSameAsBilling(false);
        }
      } catch {
        // Guest checkout — no profile to prefill from.
      }
    }
    void prefill();
  }, []);

  function goToPayment() {
    const billingIssues = addressMissingFields(billing, true);
    const shippingIssues = shippingSameAsBilling
      ? []
      : addressMissingFields(shipping, false);

    if (billingIssues.length > 0 || shippingIssues.length > 0) {
      setFormErrors([
        ...(billingIssues.length > 0 ? ["Please complete all required contact & billing fields."] : []),
        ...(shippingIssues.length > 0 ? ["Please complete all required shipping fields."] : []),
      ]);
      return;
    }

    setFormErrors([]);
    setStep("payment");
  }

  async function handlePay() {
    setPaymentError(null);
    setPaymentState("creating");

    try {
      const createResponse = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
            set_pieces: item.setPieces,
            line_total: cartLineInfo(item).lineTotal,
            customizations: item.customizations ?? [],
          })),
          billing,
          shipping,
          shippingSameAsBilling,
        }),
      });

      const order = (await createResponse.json()) as {
        wooOrderId?: number;
        razorpayOrderId?: string;
        amount?: number;
        currency?: string;
        customerName?: string;
        customerEmail?: string;
        customerPhone?: string;
        error?: string;
      };

      if (!createResponse.ok || !order.razorpayOrderId || !order.wooOrderId) {
        throw new Error(order.error || "Unable to start payment");
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Unable to load the payment gateway. Please check your connection.");
      }

      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Payments are not configured yet.");
      }

      setPaymentState("awaiting-payment");

      const razorpay = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount!,
        currency: order.currency || "INR",
        name: "Little & Co.",
        description: `Order #${order.wooOrderId}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: order.customerName,
          email: order.customerEmail,
          contact: order.customerPhone,
        },
        theme: { color: "#181411" },
        handler: (response) => {
          void (async () => {
            setPaymentState("verifying");
            try {
              const verifyResponse = await fetch("/api/checkout/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  wooOrderId: order.wooOrderId,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyResult = (await verifyResponse.json()) as {
                success?: boolean;
                error?: string;
              };
              if (!verifyResponse.ok || !verifyResult.success) {
                throw new Error(verifyResult.error || "Payment could not be verified");
              }
              clearCart();
              router.push(`/checkout/success?order=${order.wooOrderId}`);
            } catch (verifyError) {
              setPaymentState("failed");
              setPaymentError(
                verifyError instanceof Error
                  ? verifyError.message
                  : "We received your payment but couldn't confirm your order. Please contact us.",
              );
            }
          })();
        },
        modal: {
          ondismiss: () => {
            setPaymentState("idle");
          },
        },
      });

      razorpay.open();
    } catch (error) {
      setPaymentState("failed");
      setPaymentError(error instanceof Error ? error.message : "Unable to start payment");
    }
  }

  if (!mounted) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-8 md:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="font-(family-name:--font-body) text-base text-black/60">Loading checkout...</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
        <section className="mx-auto max-w-2xl border border-black/10 px-6 py-10 text-center sm:px-10 sm:py-14">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.24em] text-black/45">
            Cart
          </p>
          <h1 className="mt-3 font-(family-name:--font-body) text-[2rem] leading-tight text-black sm:text-[2.35rem]">
            Your cart is empty.
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-(family-name:--font-body) text-base leading-7 text-black/65">
            Add items to your cart to continue.
          </p>
          <a
            href="/shop"
            className="button-soft mt-8 inline-flex h-12 items-center justify-center border border-black bg-black px-6 font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85"
          >
            Continue Shopping
          </a>
        </section>
      </main>
    );
  }

  const isProcessing =
    paymentState === "creating" || paymentState === "awaiting-payment" || paymentState === "verifying";

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-6xl">
        <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.24em] text-black/45">
          Checkout
        </p>
        <h1 className="mt-3 font-(family-name:--font-body) text-[2.2rem] leading-tight text-black sm:text-[2.7rem]">
          Secure <span className="font-(family-name:--font-heading)">checkout</span>
        </h1>

        {/* Step indicator */}
        <div className="mt-6 flex items-center gap-3 font-(family-name:--font-body) text-sm">
          <span
            className={`flex h-7 w-7 items-center justify-center border text-xs ${
              step === "details" ? "border-black bg-black text-white" : "border-black/25 text-black/45"
            }`}
          >
            1
          </span>
          <span className={step === "details" ? "text-black" : "text-black/45"}>
            Details & Address
          </span>
          <span className="h-px w-8 bg-black/15" />
          <span
            className={`flex h-7 w-7 items-center justify-center border text-xs ${
              step === "payment" ? "border-black bg-black text-white" : "border-black/25 text-black/45"
            }`}
          >
            2
          </span>
          <span className={step === "payment" ? "text-black" : "text-black/45"}>Payment</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="border border-black/10 bg-white/40 p-6 sm:p-8">
            {step === "details" ? (
              <>
                <h2 className="font-(family-name:--font-body) text-xl text-black">
                  Contact & Billing Address
                </h2>
                <p className="mt-1 font-(family-name:--font-body) text-sm text-black/55">
                  We&apos;ll use this to confirm your order and arrange delivery.
                </p>
                <div className="mt-6">
                  <AddressForm
                    address={billing}
                    onChange={setBilling}
                    idPrefix="billing"
                    showContactFields
                  />
                </div>

                <div className="mt-8 flex items-center gap-2.5 border-t border-black/10 pt-6">
                  <input
                    id="same-as-billing"
                    type="checkbox"
                    checked={shippingSameAsBilling}
                    onChange={(e) => setShippingSameAsBilling(e.target.checked)}
                    className="h-4 w-4 accent-black"
                  />
                  <label
                    htmlFor="same-as-billing"
                    className="font-(family-name:--font-body) text-sm text-black/75"
                  >
                    Shipping address is the same as billing
                  </label>
                </div>

                {!shippingSameAsBilling && (
                  <div className="mt-6 border-t border-black/10 pt-6">
                    <h2 className="font-(family-name:--font-body) text-xl text-black">
                      Shipping Address
                    </h2>
                    <div className="mt-6">
                      <AddressForm address={shipping} onChange={setShipping} idPrefix="shipping" />
                    </div>
                  </div>
                )}

                {formErrors.length > 0 && (
                  <div className="mt-6 border border-[#b91c1c]/25 bg-[#fff5f5] px-4 py-3 font-(family-name:--font-body) text-sm leading-6 text-[#9f1239]">
                    {formErrors.map((err) => (
                      <p key={err}>{err}</p>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={goToPayment}
                  className="button-soft mt-8 inline-flex h-13 w-full items-center justify-center border border-black bg-black font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85 sm:w-auto sm:px-10"
                >
                  Continue to Payment
                </button>
              </>
            ) : (
              <>
                <h2 className="font-(family-name:--font-body) text-xl text-black">Review & Pay</h2>
                <p className="mt-1 font-(family-name:--font-body) text-sm text-black/55">
                  Confirm your details below, then pay securely with Razorpay.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="border border-black/10 p-4">
                    <p className="font-(family-name:--font-body) text-[0.7rem] uppercase tracking-[0.16em] text-black/45">
                      Billing Address
                    </p>
                    <p className="mt-2 font-(family-name:--font-body) text-sm leading-6 text-black/80">
                      {billing.first_name} {billing.last_name}
                      <br />
                      {billing.address_1}
                      {billing.address_2 ? `, ${billing.address_2}` : ""}
                      <br />
                      {billing.city}, {billing.state} {billing.postcode}
                      <br />
                      {billing.country}
                      <br />
                      {billing.email}
                      {billing.phone ? ` · ${billing.phone}` : ""}
                    </p>
                  </div>
                  <div className="border border-black/10 p-4">
                    <p className="font-(family-name:--font-body) text-[0.7rem] uppercase tracking-[0.16em] text-black/45">
                      Shipping Address
                    </p>
                    {(() => {
                      const s = shippingSameAsBilling ? billing : shipping;
                      return (
                        <p className="mt-2 font-(family-name:--font-body) text-sm leading-6 text-black/80">
                          {s.first_name} {s.last_name}
                          <br />
                          {s.address_1}
                          {s.address_2 ? `, ${s.address_2}` : ""}
                          <br />
                          {s.city}, {s.state} {s.postcode}
                          <br />
                          {s.country}
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("details")}
                  className="mt-4 font-(family-name:--font-body) text-sm text-black/60 underline underline-offset-4 hover:text-black"
                >
                  Edit details
                </button>

                {paymentError && (
                  <div className="mt-6 border border-[#b91c1c]/25 bg-[#fff5f5] px-4 py-3 font-(family-name:--font-body) text-sm leading-6 text-[#9f1239]">
                    {paymentError}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={isProcessing}
                  className={`button-soft relative mt-8 inline-flex h-14 w-full items-center justify-center overflow-hidden border font-(family-name:--font-body) text-[0.98rem] uppercase tracking-[0.18em] text-white transition-colors ${
                    isProcessing
                      ? "cursor-progress border-black/75 bg-black/75"
                      : "cursor-pointer border-black bg-black hover:bg-black/85"
                  }`}
                >
                  {paymentState === "creating" && "Preparing your order..."}
                  {paymentState === "awaiting-payment" && "Waiting for payment..."}
                  {paymentState === "verifying" && "Confirming your order..."}
                  {(paymentState === "idle" || paymentState === "failed") &&
                    `Pay ${formatPrice(subtotal)}`}
                </button>

                <p className="mt-4 flex items-center gap-2 font-(family-name:--font-body) text-xs text-black/45">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path
                      d="M12 2 4 5v6c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V5l-8-3Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Payments are secured and processed by Razorpay.
                </p>
              </>
            )}
          </section>

          <aside className="h-fit border border-black/10 bg-white/35 p-6 lg:sticky lg:top-28">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
              Order Summary ({totalItems} item{totalItems === 1 ? "" : "s"})
            </p>
            <div className="mt-5 space-y-4 border-t border-black/10 pt-5">
              {items.map((item) => (
                <div key={item.key ?? item.id} className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden border border-black/10 bg-white">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1 font-(family-name:--font-body) text-sm leading-6 text-black">
                    <p className="line-clamp-2">{item.name}</p>
                    <p className="text-black/55">Qty {item.quantity}</p>
                  </div>
                  <p className="shrink-0 font-(family-name:--font-body) text-sm text-black">
                    {formatPrice(cartLineInfo(item).lineTotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3 border-t border-black/10 pt-5">
              <div className="flex items-center justify-between font-(family-name:--font-body) text-base text-black/70">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-black/10 pt-4 font-(family-name:--font-body) text-[1.18rem] text-black">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            </div>
            <p className="mt-5 font-(family-name:--font-body) text-sm leading-6 text-black/60">
              Shipping and any applicable charges will be confirmed after checkout.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
