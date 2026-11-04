import Reveal from "@/components/reveal";
import { services } from "@/lib/services";

const liveEventServices = services.filter((service) => service.slug !== "leafing" && service.slug !== "foil-stamping");

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
            Made live, just for your guests
          </h2>
          <p className="mx-auto mt-5 max-w-4xl font-(family-name:--font-body) text-[1.05rem] md:text-[1.18rem] leading-7 md:leading-8 tracking-[0.32px] text-black/85">
            On-site personalisation and calligraphy for brand events, celebrations and exhibitions — names that make the gifts personalised &amp; that guests can take away with them.
          </p>
        </div>

        <div className="lift-card mx-auto mt-10 flex w-fit overflow-hidden shadow-[0px_18px_40px_rgba(0,0,0,0.16)] md:mt-12">
          <picture>
            <source media="(min-width: 768px)" srcSet="/events-bg-desktop.jpeg" />
            <img
              src="/events-bg.jpeg"
              alt="Live calligraphy event setup"
              className="media-soft block max-h-144 w-auto"
            />
          </picture>
        </div>

        <div className="mx-auto mt-6 grid max-w-5xl gap-4 border-t border-black/10 pt-6 text-center md:grid-cols-2 md:gap-6">
          {liveEventServices.map((service) => (
            <span
              key={service.slug}
              className="font-(family-name:--font-body) text-sm uppercase tracking-[0.22em] text-black/55"
            >
              {service.label}
            </span>
          ))}
        </div>

        <p className="mt-8 text-center font-(family-name:--font-body) text-sm text-black/55">
          For live event enquiries{" "}
          littleccoartmakes@gmail.com
        </p>
      </div>
    </Reveal>
  );
}
