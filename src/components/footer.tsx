import Link from "next/link";

const socialLinks = [
  {
    href: "https://www.instagram.com/littlecmakes/",
    label: "Instagram",
    icon: "/instagram.png",
  },
  {
    href: "https://wa.me/9897198971",
    label: "WhatsApp",
    icon: "/whatsapp.png",
  },
];

const quickLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/#about", label: "About" },
  { href: "/account", label: "Account" },
];

export default function Footer() {
  return (
    <footer className="border-t border-black/10 px-6 py-10 sm:px-8 md:px-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_minmax(0,1fr)] md:gap-12">
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <img
            src="/littlecco_logo.png"
            alt="Little c.co Art Makes"
            className="media-soft h-28 w-auto sm:h-32"
          />
          <p className="mt-4 max-w-md font-(family-name:--font-body) text-[0.98rem] leading-7 text-black/70">
            Bespoke calligraphy, engraving, foiling, and keepsakes made for celebrations, gifting, and thoughtful details.
          </p>
          <div className="mt-5 flex items-center gap-4">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
                className="transition-opacity hover:opacity-70"
              >
                <img src={link.icon} alt="" className="size-5 object-contain" />
              </a>
            ))}
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
            Quick Links
          </p>
          <nav className="mt-4 flex flex-col gap-3" aria-label="Footer">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-(family-name:--font-body) text-base text-black/80 transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="text-center md:text-left">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
            Contact
          </p>
          <div className="mt-4 flex flex-col gap-4">
            <a
              href="mailto:littleccoartmakes@gmail.com"
              className="inline-flex items-center justify-center gap-2.5 font-(family-name:--font-body) text-base leading-7 text-black/80 transition-colors hover:text-black md:justify-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              littleccoartmakes@gmail.com
            </a>
            <a
              href="tel:9897198971"
              className="inline-flex items-center justify-center gap-2.5 font-(family-name:--font-body) text-base leading-7 text-black/80 transition-colors hover:text-black md:justify-start"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
              </svg>
              9897198971
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-black/10 pt-5">
        <p className="text-center font-(family-name:--font-body) text-sm text-black/50 md:text-left">
          © {new Date().getFullYear()} Little c.co Art Makes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
