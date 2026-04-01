"use client";

import { useMemo } from "react";
import { useCartStore } from "@/lib/cart-store";

function formatPrice(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const setItemQuantity = useCartStore((state) => state.setItemQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <main className="bg-[#f5f0e8] min-h-screen px-8 py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-6xl">
        <h1 className="font-heading text-5xl text-black mb-10">Your Cart</h1>

        {items.length === 0 ? (
          <div className="relative bg-[#fbf3e0] p-8 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none" />
            <div className="relative z-10">
              <p className="font-(family-name:--font-body) text-xl text-black mb-4">
                Your cart is empty.
              </p>
              <a
                href="/shop"
                className="inline-flex items-center justify-center bg-black text-white font-(family-name:--font-body) text-lg px-6 h-12"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="relative bg-[#fbf3e0] p-4 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
                >
                  <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
                    <a href={`/products/${item.slug}`} className="w-24 shrink-0 border border-[#d2bc70] overflow-hidden">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full aspect-square object-cover" />
                      ) : (
                        <div className="w-full aspect-square bg-[#f0e6c8]" />
                      )}
                    </a>

                    <div className="flex-1 min-w-0">
                      <a
                        href={`/products/${item.slug}`}
                        className="font-(family-name:--font-body) text-lg text-black hover:underline block truncate"
                      >
                        {item.name}
                      </a>
                      <p className="font-(family-name:--font-body) text-base text-black mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="flex items-center border border-black h-11.5 w-fit">
                      <button
                        type="button"
                        onClick={() => setItemQuantity(item.id, item.quantity - 1)}
                        className="w-11 h-full bg-[#e3e3e3] border-r border-black font-(family-name:--font-body) text-xl"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        −
                      </button>
                      <span className="w-12 h-full flex items-center justify-center font-(family-name:--font-body) text-lg">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setItemQuantity(item.id, item.quantity + 1)}
                        className="w-11 h-full bg-[#e3e3e3] border-l border-black font-(family-name:--font-body) text-xl"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-(family-name:--font-body) text-lg text-black">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-(family-name:--font-body) text-sm text-black/70 hover:text-black"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="relative bg-[#fbf3e0] p-6 h-fit shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none" />
              <div className="relative z-10">
                <h2 className="font-heading text-3xl text-black mb-5">Summary</h2>

                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between font-(family-name:--font-body) text-base text-black">
                    <span>Items</span>
                    <span>{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-between font-(family-name:--font-body) text-lg text-black">
                    <span>Subtotal</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                </div>

                <a
                  href="/checkout"
                  className="w-full bg-black text-white font-(family-name:--font-body) text-lg h-12 inline-flex items-center justify-center cursor-pointer hover:bg-[#1a1a1a] transition-colors"
                >
                  Proceed to Checkout
                </a>

                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full mt-4 border border-black text-black font-(family-name:--font-body) text-base h-11"
                >
                  Clear Cart
                </button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
