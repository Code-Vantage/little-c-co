"use client";

import { useCartStore } from "../lib/cart-store";

function CartIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

export default function CartNavLink() {
  const cartCount = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  );

  return (
    <a href="/cart" aria-label="Cart" className="relative text-black hover:opacity-70 transition-opacity">
      <CartIcon />
      {cartCount > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-black text-white text-[11px] leading-5 text-center font-(family-name:--font-body)">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </a>
  );
}
