"use client";

import { useEffect, useMemo, useState } from "react";
import { useCartStore } from "@/lib/cart-store";

type CheckoutResponse = {
  checkoutUrl?: string;
  error?: string;
};

function formatPrice(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || redirecting || items.length === 0) {
      return;
    }

    async function redirectToWooCheckout() {
      setRedirecting(true);
      setError(null);

      try {
        const response = await fetch("/api/checkout/woocommerce", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: items.map((item) => ({
              product_id: item.id,
              quantity: item.quantity,
            })),
          }),
        });

        const result = (await response.json()) as CheckoutResponse;

        if (!response.ok || !result.checkoutUrl) {
          throw new Error(result.error || "Unable to start checkout");
        }

        window.location.assign(result.checkoutUrl);
      } catch (checkoutError) {
        setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start checkout");
        setRedirecting(false);
      }
    }

    void redirectToWooCheckout();
  }, [items, mounted, redirecting]);

  if (!mounted) {
    return (
      <main className="min-h-screen px-4 py-10 sm:px-8 md:px-16">
        <div className="mx-auto max-w-3xl">
          <p className="font-(family-name:--font-body) text-base text-black/60">Preparing checkout...</p>
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

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="border border-black/10 bg-white/35 p-6 sm:p-8">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.24em] text-black/45">
            Checkout
          </p>
          <h1 className="mt-3 font-(family-name:--font-body) text-[2.2rem] leading-tight text-black sm:text-[2.7rem]">
            Redirecting to checkout
          </h1>
          <p className="mt-4 font-(family-name:--font-body) text-base leading-7 text-black/65">
            Please wait while your cart is prepared.
          </p>

          {error && (
            <div className="mt-6 border border-[#b91c1c]/25 bg-[#fff5f5] px-4 py-3 font-(family-name:--font-body) text-sm leading-6 text-[#9f1239]">
              {error}
            </div>
          )}

          <button
            type="button"
            disabled={redirecting}
            onClick={() => {
              setRedirecting(false);
              setError(null);
            }}
            className={`button-soft mt-8 inline-flex h-12 items-center justify-center border border-black px-6 font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] transition-colors ${
              redirecting
                ? "cursor-progress bg-black/70 text-white"
                : "cursor-pointer bg-black text-white hover:bg-black/85"
            }`}
          >
            {redirecting ? "Redirecting..." : "Try Again"}
          </button>
        </section>

        <aside className="h-fit border border-black/10 bg-white/35 p-6">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
            Order Summary
          </p>
          <div className="mt-5 space-y-4 border-t border-black/10 pt-5">
            {items.map((item) => (
              <div key={item.key ?? item.id} className="flex items-start justify-between gap-4">
                <div className="min-w-0 font-(family-name:--font-body) text-sm leading-6 text-black">
                  <p className="break-words">{item.name}</p>
                  <p className="text-black/55">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 font-(family-name:--font-body) text-sm text-black">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5 font-(family-name:--font-body) text-[1.05rem] text-black">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
