"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import Reveal from "@/components/reveal";

const surfaces = [
  {
    name: "Paper",
    image: "/surfaces/paper.JPG",
    alt: "Hand-lettered kraft paper cards with pressed flowers",
  },
  {
    name: "Canvas",
    image: "/surfaces/canvas.JPG",
    alt: "Dark canvas beside soft florals",
  },
  {
    name: "Fabric & Linen",
    image: "/surfaces/fabric(linen).JPG",
    alt: "White calligraphy on burgundy linen fabric",
  },
  {
    name: "Glass",
    image: "/surfaces/glass.PNG",
    alt: "Personalized calligraphy on a glass perfume bottle",
  },
  {
    name: "Metal",
    image: "/surfaces/metal.PNG",
    alt: "Polished gold compact mirror",
  },
  {
    name: "Plastic",
    image: "/surfaces/plastic.JPG",
    alt: "Personalized lettering on a white ribbed candle vessel",
  },
  {
    name: "Wood",
    image: "/surfaces/wood.JPG",
    alt: "Personalized lettering on a round wooden table marker",
  },
] as const;

function SurfaceCard({ surface, priority = false }: { surface: (typeof surfaces)[number]; priority?: boolean }) {
  return (
    <article
      data-surface-card
      className="lift-card group relative h-[24rem] w-[82vw] max-w-[24rem] flex-none snap-start overflow-hidden border border-[#d8d1c7] bg-[#fffdf9] shadow-[0px_12px_28px_rgba(15,23,42,0.07)] sm:w-[22rem] md:h-[30rem] md:w-[25rem] lg:w-[27rem]"
    >
      <Image
        src={surface.image}
        alt={surface.alt}
        width={640}
        height={820}
        sizes="(min-width: 1024px) 432px, (min-width: 768px) 400px, (min-width: 640px) 352px, 82vw"
        className="media-soft h-full w-full object-cover"
        priority={priority}
      />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/58 via-black/18 to-transparent px-4 pb-4 pt-16">
        <div className="flex items-end justify-between gap-4 border-t border-white/35 pt-3">
          <h3 className="font-(family-name:--font-body) text-sm uppercase tracking-[0.24em] text-white">
            {surface.name}
          </h3>
          <span className="h-px w-10 bg-white/65 transition-all duration-300 group-hover:w-16" />
        </div>
      </div>
    </article>
  );
}

export default function Surfaces() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef(false);

  function scrollSlider(direction: -1 | 1) {
    const slider = sliderRef.current;
    if (!slider) return;

    const card = slider.querySelector<HTMLElement>("[data-surface-card]");
    const scrollAmount = card ? card.offsetWidth + 16 : slider.clientWidth * 0.85;
    const maxScrollLeft = slider.scrollWidth - slider.clientWidth;

    if (direction === 1 && slider.scrollLeft >= maxScrollLeft - 2) {
      slider.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (direction === -1 && slider.scrollLeft <= 2) {
      slider.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    slider.scrollBy({
      left: direction * scrollAmount,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      if (document.hidden || isPausedRef.current) return;
      scrollSlider(1);
    }, 3200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <Reveal
      as="section"
      aria-label="Crafted Across Surfaces"
      className="overflow-hidden px-6 py-14 md:px-16 md:py-18"
      delay={90}
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div className="mx-auto max-w-4xl text-center md:mx-0 md:max-w-3xl md:text-left">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
              Materials
            </p>
            <h2 className="mt-3 font-(family-name:--font-heading) text-4xl text-black md:text-5xl">
              Crafted Across Surfaces
            </h2>
            <p className="mx-auto mt-5 max-w-3xl font-(family-name:--font-body) text-[1.05rem] leading-7 tracking-[0.32px] text-black/75 md:mx-0 md:text-[1.16rem] md:leading-8">
              From delicate paper details to glass, metal, wood, fabric, canvas, and more, each surface is carefully prepared for refined hand lettering.
            </p>
          </div>

          <div className="flex justify-center gap-3 md:justify-end">
            <button
              type="button"
              aria-label="Previous surface"
              onClick={() => scrollSlider(-1)}
              className="button-soft flex h-11 w-11 items-center justify-center border border-[#d8d1c7] bg-[#fffdf9] font-(family-name:--font-body) text-xl leading-none text-black/70 shadow-[0px_10px_24px_rgba(15,23,42,0.08)] hover:border-[#cfc5b7] hover:text-black"
            >
              <span aria-hidden="true">&lt;</span>
            </button>
            <button
              type="button"
              aria-label="Next surface"
              onClick={() => scrollSlider(1)}
              className="button-soft flex h-11 w-11 items-center justify-center border border-[#d8d1c7] bg-[#fffdf9] font-(family-name:--font-body) text-xl leading-none text-black/70 shadow-[0px_10px_24px_rgba(15,23,42,0.08)] hover:border-[#cfc5b7] hover:text-black"
            >
              <span aria-hidden="true">&gt;</span>
            </button>
          </div>
        </div>

        <div className="relative mt-10 md:mt-12">
          <div
            ref={sliderRef}
            onMouseEnter={() => {
              isPausedRef.current = true;
            }}
            onMouseLeave={() => {
              isPausedRef.current = false;
            }}
            onFocusCapture={() => {
              isPausedRef.current = true;
            }}
            onBlurCapture={() => {
              isPausedRef.current = false;
            }}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {surfaces.map((surface, index) => (
              <SurfaceCard key={surface.name} surface={surface} priority={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
