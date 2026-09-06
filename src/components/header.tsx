"use client";

import { useState } from "react";
import CartNavLink from "@/components/cart-nav-link";
import { services } from "@/lib/services";
import { navCollections } from "@/lib/collections";
import Link from "next/link";

// Header Shop dropdown: the nav collections, with the "Curate your hamper" page
// slotted in right after "Little Stuff".
const shopMenuLinks: { label: string; href: string }[] = navCollections.flatMap(
  (collection) => {
    const link = { label: collection.label, href: `/shop/${collection.slug}` };
    return collection.slug === "little-stuff"
      ? [link, { label: "Curate your hamper", href: "/curate-your-hamper" }]
      : [link];
  },
);

const navServiceOrder = ["calligraphy", "engraving", "foil-stamping"];
const navServices = [...services].sort((a, b) => {
  const aPosition = navServiceOrder.indexOf(a.slug);
  const bPosition = navServiceOrder.indexOf(b.slug);

  return (
    (aPosition === -1 ? navServiceOrder.length : aPosition) -
    (bPosition === -1 ? navServiceOrder.length : bPosition)
  );
});

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
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);

  return (
    <header className="relative z-50 w-full capitalize bg-[rgba(252,250,247,0.92)] shadow-[0px_5px_7px_0px_rgba(0,0,0,0.14)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-360 items-center justify-between px-4 py-3 lg:justify-start lg:gap-7 lg:px-8 lg:py-2">
        
        {/* Mobile Hamburger Button */}
        <button 
          className="button-soft cursor-pointer p-1 text-black lg:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Logo */}
        <Link href="/" className="flex flex-1 justify-center lg:flex-none lg:shrink-0 lg:justify-start">
          <img
            alt="LittleCCO Logo"
            className="h-14 w-auto lg:h-18"
            src="/littlecco_logo.png"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </Link>

        {/* Desktop Search bar */}
        <form
          action="/shop"
          method="get"
          role="search"
          className="mx-auto hidden w-full max-w-lg items-center rounded-full border-2 border-black px-1 pl-4 py-1 lg:flex"
        >
          <input
            type="search"
            name="q"
            placeholder="Search"
            aria-label="Search products"
            className="flex-1 bg-transparent font-(family-name:--font-body) text-[0.95rem] text-black placeholder:text-black/40 outline-none"
          />
          <button
            type="submit"
            aria-label="Search"
            className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-opacity hover:opacity-70"
          >
            <SearchIcon />
          </button>
        </form>

        {/* Desktop Nav links & Mobile Right Icons */}
        <div className="flex shrink-0 items-center gap-4 lg:gap-5"> 
          <nav aria-label="Primary" className="hidden items-center gap-5 lg:flex">
            <div
              className="relative"
              onMouseEnter={() => setIsServicesMenuOpen(true)}
              onMouseLeave={() => setIsServicesMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsServicesMenuOpen(true)}
                aria-expanded={isServicesMenuOpen}
                aria-controls="services-menu"
                className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap font-(family-name:--font-body) text-[1.02rem] text-black transition-opacity hover:opacity-70"
              >
                Services
                <svg className={`transition-transform ${isServicesMenuOpen ? "rotate-180" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div
                id="services-menu"
                className={`absolute left-0 top-full z-50 pt-4 transition-all duration-200 ${
                  isServicesMenuOpen
                    ? "visible opacity-100"
                    : "invisible pointer-events-none opacity-0"
                }`}
              >
                <div className="min-w-56 border border-black/10 bg-white shadow-[0px_18px_36px_rgba(15,23,42,0.08)]">
                  {navServices.map((service) => (
                    <Link
                      key={service.slug}
                      href={`/services/${service.slug}`}
                      onClick={() => setIsServicesMenuOpen(false)}
                      className="block border-b border-black/6 px-5 py-3 font-(family-name:--font-body) text-[0.96rem] text-black/80 transition-colors hover:bg-black/[0.03] hover:text-black last:border-b-0"
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="group relative">
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 whitespace-nowrap font-(family-name:--font-body) text-[1.02rem] text-black transition-opacity hover:opacity-70"
              >
                Shop
                <svg className="transition-transform group-hover:rotate-180" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </Link>
              <div className="invisible absolute left-0 top-full z-50 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                <div className="min-w-56 border border-black/10 bg-white shadow-[0px_18px_36px_rgba(15,23,42,0.08)]">
                  {shopMenuLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block border-b border-black/6 px-5 py-3 font-(family-name:--font-body) text-[0.96rem] text-black/80 transition-colors hover:bg-black/[0.03] hover:text-black last:border-b-0"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/#about" className="whitespace-nowrap font-(family-name:--font-body) text-[1.02rem] text-black transition-opacity hover:opacity-70">
              About
            </Link>
          </nav>
          
          <CartNavLink />
          <Link href="/account" aria-label="Account" className="flex items-center text-black transition-opacity hover:opacity-70">
            <UserIcon />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer/Menu */}
      <div 
        className={`lg:hidden absolute top-full left-0 w-full border-t border-black/10 shadow-xl transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-[85vh] overflow-y-auto opacity-100" : "max-h-0 overflow-hidden opacity-0 pointer-events-none border-t-0 border-transparent shadow-none"
        }`}
      >
        <div className="flex flex-col gap-6 bg-[var(--background)] px-5 py-6">
          <form
            action="/shop"
            method="get"
            role="search"
            className="flex w-full items-center rounded-full border-2 border-black px-1 py-1.5 pl-4"
            onSubmit={() => setIsMobileMenuOpen(false)}
          >
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent font-(family-name:--font-body) text-[0.95rem] text-black placeholder:text-black/50 outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-black transition-opacity hover:opacity-70"
            >
              <SearchIcon />
            </button>
          </form>

          <nav className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
              <Link
                onClick={() => setIsMobileMenuOpen(false)}
                href="/shop"
                className="font-(family-name:--font-body) text-[1.12rem] text-black transition-colors hover:text-black/70"
              >
                Shop
              </Link>
              <div className="ml-2 flex flex-col gap-3 border-l border-black/10 pl-4">
                {shopMenuLinks.map((item) => (
                  <Link
                    key={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    href={item.href}
                    className="font-(family-name:--font-body) text-[0.97rem] text-black/75 transition-colors hover:text-black"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <hr className="border-t border-black/10" />
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsServicesMenuOpen((isOpen) => !isOpen)}
                aria-expanded={isServicesMenuOpen}
                aria-controls="mobile-services-menu"
                className="flex w-full cursor-pointer items-center justify-between font-(family-name:--font-body) text-[1.12rem] text-black"
              >
                Services
                <svg className={`transition-transform ${isServicesMenuOpen ? "rotate-180" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {isServicesMenuOpen && (
                <div id="mobile-services-menu" className="ml-2 flex flex-col gap-3 border-l border-black/10 pl-4">
                  {navServices.map((service) => (
                    <Link
                      key={service.slug}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsServicesMenuOpen(false);
                      }}
                      href={`/services/${service.slug}`}
                      className="font-(family-name:--font-body) text-[0.97rem] text-black/75 transition-colors hover:text-black"
                    >
                      {service.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <hr className="border-t border-black/10" />
            <Link 
              onClick={() => setIsMobileMenuOpen(false)} 
              href="/#about" 
              className="font-(family-name:--font-body) text-[1.12rem] text-black transition-colors hover:text-black/70"
            >
              About
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
