export default function Footer() {
  return (
    <footer className="bg-[#fff5e8] shadow-[0px_-5px_10px_0px_rgba(0,0,0,0.15)] py-10 px-8">
      <div className="mx-auto max-w-6xl flex flex-col items-center gap-6">

        {/* Logo */}
        <img
          src="/littlecco_logo.png"
          alt="Little c.co Art Makes"
          className="h-40 w-auto"
        />

        {/* Social icons */}
        <div className="flex items-center gap-5">
          {/* Instagram */}
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <img src="/instagram.png" alt="" className="size-6 object-contain" />
          </a>
          {/* WhatsApp */}
          <a href="https://wa.me/9897198971" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <img src="/whatsapp.png" alt="" className="size-6 object-contain" />
          </a>
          {/* Facebook */}
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <img src="/facebook.png" alt="" className="size-6 object-contain" />
          </a>
        </div>

        {/* Email */}
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
          <a href="mailto:littleccoartmakes@gmail.com" className="font-(family-name:--font-body) text-base text-black hover:underline">
            littleccoartmakes@gmail.com
          </a>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/>
          </svg>
          <a href="tel:9897198971" className="font-(family-name:--font-body) text-base text-black hover:underline">
            9897198971
          </a>
        </div>

        {/* Copyright */}
        <p className="font-(family-name:--font-body) text-sm text-black/50 mt-2">
          © {new Date().getFullYear()} Little c.co Art Makes. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

