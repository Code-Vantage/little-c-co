import Link from "next/link";
import { services } from "@/lib/services";

export default function ServicesIndexPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
            Services
          </p>
          <h1 className="mt-3 font-(family-name:--font-heading) text-4xl text-black md:text-5xl">
            Crafted details for thoughtful occasions
          </h1>
          <p className="mt-4 font-(family-name:--font-body) text-[1rem] leading-7 text-black/72 md:text-[1.08rem]">
            Explore the personalization services for gifting, events, and bespoke keepsakes.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="border border-black/10 bg-white/50 p-6 transition-shadow hover:shadow-[0px_14px_34px_rgba(15,23,42,0.07)]"
            >
              <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                {service.eyebrow}
              </p>
              <h2 className="mt-3 font-(family-name:--font-heading) text-3xl text-black">
                {service.title}
              </h2>
              <p className="mt-4 font-(family-name:--font-body) text-base leading-7 text-black/72">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
