import CartNavLink from "@/components/cart-nav-link";
import Link from "next/link";

function UserIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
  );
}

export default function Header() {
  return (
    <header className="w-full shadow-[0px_5px_7px_0px_rgba(0,0,0,0.14)]">
      <div className="mx-auto flex max-w-7xl items-center gap-8 py-1">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <img
            alt="LittleCCO Logo"
            className="h-24 w-auto"
            src="/littlecco_logo.png"
          />
        </Link>

        {/* Search bar */}
        <form
          action="/shop"
          method="get"
          role="search"
          className="mx-auto flex w-full max-w-xl items-center rounded-full border-3 border-black px-1 pl-5 py-1"
        >
          <input
            type="search"
            name="q"
            placeholder="Search"
            aria-label="Search products"
            className="font-(family-name:--font-body) flex-1 bg-transparent text-base text-black placeholder:text-black/40 outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 cursor-pointer"
          >
            <SearchIcon />
          </button>
        </form>

        {/* Nav links */}
        <nav aria-label="Primary" className="flex shrink-0 items-center gap-6">
          <Link href="/shop" className="font-(family-name:--font-body) text-lg text-black whitespace-nowrap hover:opacity-70 transition-opacity">
            Shop
          </Link>
          <Link href="/#about" className="font-(family-name:--font-body) text-lg text-black whitespace-nowrap hover:opacity-70 transition-opacity">
            About
          </Link>
          <CartNavLink />
          <Link href="/account" aria-label="Account" className="text-black hover:opacity-70 transition-opacity">
            <UserIcon />
          </Link>
        </nav>
      </div>
    </header>
  );
}
