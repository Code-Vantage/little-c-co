"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";
import { cartLineInfo, getPricingRule } from "@/lib/pricing";

function formatPrice(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + cartLineInfo(item).lineTotal, 0),
    [items],
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-7xl">
        <section className="border-b border-black/10 pb-8 sm:pb-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                Shopping Cart
              </p>
              <h1 className="mt-3 font-(family-name:--font-body) text-[2.5rem] leading-tight text-black sm:text-[3.2rem]">
                Your <span className="font-(family-name:--font-heading)">cart</span>
              </h1>
              <p className="mt-4 max-w-2xl font-(family-name:--font-body) text-base leading-7 text-black/65 sm:text-lg">
                Review your selections, update quantities, and continue to checkout when you&apos;re ready.
              </p>
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <section className="mx-auto mt-10 max-w-2xl border border-black/10 px-6 py-10 text-center sm:px-10 sm:py-14">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.24em] text-black/45">
              No items yet
            </p>
            <h2 className="mt-3 font-(family-name:--font-body) text-[2rem] leading-tight text-black sm:text-[2.4rem]">
              Your <span className="font-(family-name:--font-heading)">cart</span> is currently empty.
            </h2>
            <p className="mx-auto mt-4 max-w-xl font-(family-name:--font-body) text-base leading-7 text-black/65">
              Explore the collection and add pieces you&apos;d like to keep, gift, or personalize.
            </p>
            <a
              href="/shop"
              className="mt-8 inline-flex h-12 items-center justify-center border border-black bg-black px-6 font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85"
            >
              Continue Shopping
            </a>
          </section>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section className="border border-black/10">
              <div className="hidden border-b border-black/10 px-6 py-4 lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px] lg:gap-6">
                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
                  Product
                </p>
                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
                  Quantity
                </p>
                <p className="text-right font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
                  Total
                </p>
              </div>

              <div>
                {items.map((item, index) => {
                  const lineKey = item.key ?? item.id;
                  const info = cartLineInfo(item);

                  return (
                  <article
                    key={lineKey}
                    className={`lift-card px-5 py-5 sm:px-6 sm:py-6 ${
                      index !== items.length - 1 ? "border-b border-black/10" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_140px_120px] lg:items-center lg:gap-6">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <a
                          href={`/products/${item.slug}`}
                          className="w-22 shrink-0 overflow-hidden border border-black/10 sm:w-24"
                        >
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" />
                          ) : (
                            <div className="w-full aspect-square bg-black/5" />
                          )}
                        </a>

                        <div className="min-w-0 flex-1">
                          <a
                            href={`/products/${item.slug}`}
                            className="block font-(family-name:--font-body) text-[1.18rem] leading-7 text-black hover:underline"
                          >
                            {item.name}
                          </a>
                          <p className="mt-1 font-(family-name:--font-body) text-base text-black/72">
                            {formatPrice(info.unitPrice)}
                            {getPricingRule(item.slug)?.kind === "tiered" ? " each" : ""}
                          </p>
                          {item.customizations && item.customizations.length > 0 && (
                            <div className="mt-2 space-y-1 font-(family-name:--font-body) text-sm leading-6 text-black/60">
                              {item.customizations.map((customization) => (
                                <p key={`${customization.key}-${customization.value}`}>
                                  {customization.key}: {customization.value}
                                </p>
                              ))}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => removeItem(lineKey)}
                            className="mt-3 font-(family-name:--font-body) text-sm text-black/60 underline underline-offset-4 hover:text-black"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.18em] text-black/45 lg:hidden">
                          Quantity
                        </p>
                        <div className="flex h-11.5 w-fit items-center border border-black/15">
                          <button
                            type="button"
                            onClick={() => setItemQuantity(lineKey, item.quantity - 1)}
                            className="h-full w-11 border-r border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                            aria-label={`Decrease quantity for ${item.name}`}
                          >
                            −
                          </button>
                          <span className="flex h-full w-12 items-center justify-center font-(family-name:--font-body) text-base">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => setItemQuantity(lineKey, item.quantity + 1)}
                            className="h-full w-11 border-l border-black/15 font-(family-name:--font-body) text-xl transition-colors hover:bg-black/5"
                            aria-label={`Increase quantity for ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-4 lg:block lg:text-right">
                        <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.18em] text-black/45 lg:hidden">
                          Total
                        </p>
                        <p className="font-(family-name:--font-body) text-[1.2rem] text-black">
                          {formatPrice(info.lineTotal)}
                        </p>
                      </div>
                    </div>
                  </article>
                  );
                })}
              </div>
            </section>

            <aside className="h-fit border border-black/10 p-6 lg:sticky lg:top-28">
              <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.22em] text-black/45">
                Order Summary
              </p>
              <h2 className="mt-3 font-(family-name:--font-body) text-[2rem] leading-tight text-black">
                Ready to checkout
              </h2>

              <div className="mt-6 space-y-3 border-t border-black/10 pt-5">
                <div className="flex items-center justify-between font-(family-name:--font-body) text-base text-black/70">
                  <span>Items</span>
                  <span>{totalItems}</span>
                </div>
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
                Shipping and any applicable charges will be confirmed during checkout.
              </p>

              <a
                href="/checkout"
                className="button-soft mt-7 inline-flex h-12 w-full items-center justify-center border border-black bg-black font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85"
              >
                Proceed to Checkout
              </a>

              <a
                href="/shop"
                className="button-soft mt-3 inline-flex h-11 w-full items-center justify-center border border-black/10 font-(family-name:--font-body) text-sm text-black transition-colors hover:bg-black/3"
              >
                Continue Shopping
              </a>

              <button
                type="button"
                onClick={clearCart}
                className="mt-6 font-(family-name:--font-body) text-sm text-black/60 underline underline-offset-4 hover:text-black"
              >
                Clear cart
              </button>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
