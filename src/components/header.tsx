"use client";

import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="w-full shadow-[0px_5px_7px_0px_rgba(0,0,0,0.14)] relative z-50 bg-[#f5f0e8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between lg:justify-start lg:gap-8 px-4 lg:px-8 py-3 lg:py-1">
        
        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden p-1 text-black cursor-pointer"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="lg:flex-none lg:shrink-0 flex-1 flex justify-center lg:justify-start">
          <img
            alt="LittleCCO Logo"
            className="h-16 lg:h-24 w-auto"
            src="/littlecco_logo.png"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </Link>

        {/* Desktop Search bar */}
        <form
          action="/shop"
          method="get"
          role="search"
          className="hidden lg:flex mx-auto w-full max-w-xl items-center rounded-full border-3 border-black px-1 pl-5 py-1"
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

        {/* Desktop Nav links & Mobile Right Icons */}
        <div className="flex shrink-0 items-center gap-4 lg:gap-6"> 
          <nav aria-label="Primary" className="hidden lg:flex items-center gap-6">
            <Link href="/shop" className="font-(family-name:--font-body) text-lg text-black whitespace-nowrap hover:opacity-70 transition-opacity">
              Shop
            </Link>
            <Link href="/#about" className="font-(family-name:--font-body) text-lg text-black whitespace-nowrap hover:opacity-70 transition-opacity">
              About
            </Link>
          </nav>
          
          <CartNavLink />
          <Link href="/account" aria-label="Account" className="text-black hover:opacity-70 transition-opacity flex items-center">
            <UserIcon />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer/Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full bg-[#f5f0e8] border-t border-black/10 shadow-xl overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none border-t-0 border-transparent shadow-none"
        }`}
      >
        <div className="px-5 py-6 flex flex-col gap-6">
          <form
            action="/shop"
            method="get"
            role="search"
            className="flex w-full items-center rounded-full border-2 border-black px-1 pl-4 py-1.5"
            onSubmit={() => setIsMobileMenuOpen(false)}
          >
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              aria-label="Search products"
              className="font-(family-name:--font-body) flex-1 min-w-0 bg-transparent text-base text-black placeholder:text-black/50 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex size-10 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-70 cursor-pointer text-black"
            >
              <SearchIcon />
            </button>
          </form>

          <nav className="flex flex-col gap-5">
            <Link 
              onClick={() => setIsMobileMenuOpen(false)} 
              href="/shop" 
              className="font-(family-name:--font-body) text-xl text-black hover:text-black/70 transition-colors"
            >
              Shop
            </Link>
            <hr className="border-t border-black/10" />
            <Link 
              onClick={() => setIsMobileMenuOpen(false)} 
              href="/#about" 
              className="font-(family-name:--font-body) text-xl text-black hover:text-black/70 transition-colors"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
