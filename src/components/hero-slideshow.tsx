"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/moodboard.webp",
    alt: "Elegant, timeless handmade creations by little c co.",
    title: "Hosting Refined",
    accent: "with Little c co.",
    mode: "moodboard",
  },
  {
    src: "/hero2.JPG",
    alt: "Personalized Team Bride hand fan beside a warm cafe setting.",
    title: "Live Engraving Stall at your Event !",
    accent: "",
    mode: "portrait",
  },
] as const;

export default function HeroSlideshow() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[34rem] overflow-hidden bg-[#1c1711] text-white sm:aspect-[3509/2260] sm:min-h-0">
      {slides.map((slide, index) => {
        const isActive = index === activeSlide;
        const isPortrait = slide.mode === "portrait";

        return (
          <div
            key={slide.src}
            aria-hidden={!isActive}
            className={`absolute inset-0 transition-opacity duration-700 ease-out ${
              isActive ? "opacity-100" : "opacity-0"
            }`}
          >
            {isPortrait ? (
              <>
                <Image
                  src={slide.src}
                  alt=""
                  fill
                  sizes="100vw"
                  className="scale-110 object-cover blur-2xl brightness-[0.5] saturate-[0.9]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(25,18,13,0.96)_0%,rgba(48,38,24,0.84)_44%,rgba(30,23,18,0.76)_100%)]" />
                <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_22%_38%,rgba(246,225,173,0.14),transparent_34%)]" />
                <div className="absolute inset-y-0 right-0 z-10 hidden aspect-[9/16] h-full sm:block">
                  <Image
                    src={slide.src}
                    alt={slide.alt}
                    fill
                    sizes="(max-width: 1024px) 38vw, 34vw"
                    className="object-cover"
                  />
                </div>
                <div className="relative z-20 grid h-full items-center gap-7 px-5 py-10 sm:max-w-[58%] sm:px-10 sm:py-12 lg:px-18">
                  <div className="max-w-lg pt-5 sm:pt-0">
                    <p className="max-w-[12ch] font-(family-name:--font-body) text-[clamp(2rem,3.6vw,4.45rem)] leading-[1.08] text-[#fff9f0] drop-shadow-[0_5px_20px_rgba(0,0,0,0.42)]">
                      {slide.title}
                    </p>
                  </div>
                  <div className="flex min-h-0 items-center justify-center sm:hidden">
                    <div className="relative h-[24rem] w-full max-w-[18rem] overflow-hidden bg-[#211810]/55 shadow-[0_28px_74px_rgba(0,0,0,0.44)]">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(max-width: 768px) 82vw, 35vw"
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  priority={index === 0}
                  sizes="100vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.48)_0%,rgba(0,0,0,0.28)_30%,rgba(0,0,0,0.04)_62%)]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/46 via-transparent to-transparent" />
                <div className="relative z-10 flex h-full items-end px-5 pb-11 sm:px-10 sm:pb-14 lg:px-16 lg:pb-18">
                  <div className="max-w-4xl">
                    <p className="font-(family-name:--font-body) text-[clamp(2.1rem,4.6vw,5.1rem)] leading-[1.02] text-white drop-shadow-[0_5px_22px_rgba(0,0,0,0.48)]">
                      {slide.title}
                    </p>
                    {slide.accent ? (
                      <p className="mt-3 font-(family-name:--font-body) text-[clamp(1rem,1.7vw,1.55rem)] leading-relaxed text-white/92 drop-shadow-[0_3px_16px_rgba(0,0,0,0.5)]">
                        {slide.accent}
                      </p>
                    ) : null}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show hero slide ${index + 1}`}
            aria-current={activeSlide === index}
            onClick={() => setActiveSlide(index)}
            className={`h-2.5 rounded-full border border-white/80 ${
              activeSlide === index ? "w-8 bg-white" : "w-2.5 bg-white/20"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
