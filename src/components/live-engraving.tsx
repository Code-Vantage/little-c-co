import Image from "next/image";
import Reveal from "@/components/reveal";

export default function LiveEngraving() {
  return (
    <Reveal as="section" aria-label="Live Engraving Stall" className="px-4 py-14 sm:px-6 md:py-16" delay={70}>
      <div className="mx-auto max-w-6xl">
        <div className="lift-card relative overflow-hidden shadow-[0px_18px_40px_rgba(0,0,0,0.16)]">
          <Image
            src="/hero2.JPG"
            alt="Live engraving stall set up at an event"
            width={1600}
            height={1000}
            sizes="(min-width: 1024px) 1152px, 100vw"
            className="media-soft block h-[22rem] w-full object-cover sm:h-[26rem] md:h-[32rem] lg:h-[38rem]"
            priority={false}
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-6 pt-24 pb-6 sm:px-10 sm:pb-8 md:px-12 md:pb-10">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-[#e7c98f]">
              At your event
            </p>
            <h2 className="mt-2 font-(family-name:--font-heading) text-3xl leading-[1.05] text-white sm:text-4xl md:text-5xl">
              Live Engraving Stall
            </h2>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
