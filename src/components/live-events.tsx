import Link from "next/link";
import Reveal from "@/components/reveal";
import { services } from "@/lib/services";

const liveEventServices = services.filter((service) => service.slug !== "leafing");

export default function LiveEvents() {
  return (
    <Reveal
      as="section"
      aria-label="Live Events"
      className="overflow-hidden px-6 py-14 md:px-16 md:py-18"
      delay={100}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-6xl text-center">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
            Live Events
          </p>
          <h2 className="mt-3 font-(family-name:--font-heading) text-4xl md:text-5xl text-black">
            Elegant personalization, live at your event
          </h2>
          <p className="mx-auto mt-5 max-w-4xl font-(family-name:--font-body) text-[1.05rem] md:text-[1.18rem] leading-7 md:leading-8 tracking-[0.32px] text-black/85">
            We bring modern calligraphy and on-site personalization directly to your venue, creating meaningful keepsakes in real time for weddings, brand activations, private dinners, and thoughtfully hosted celebrations.
          </p>
        </div>

        <div className="lift-card mt-10 overflow-hidden shadow-[0px_18px_40px_rgba(0,0,0,0.16)] md:mt-12">
          <img
            src="/events-bg.jpeg"
            alt="Live calligraphy event setup"
            className="media-soft block h-[18rem] w-full object-cover sm:h-[22rem] md:h-[28rem] lg:h-[36rem]"
          />
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-4 border-t border-black/10 pt-6 text-center md:grid-cols-3 md:gap-6">
          {liveEventServices.map((service) => (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="font-(family-name:--font-body) text-sm uppercase tracking-[0.22em] text-black/55 transition-colors hover:text-black"
            >
              {service.label}
            </Link>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
