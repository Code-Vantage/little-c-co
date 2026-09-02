import type { Metadata } from "next";
import Link from "next/link";
import { getCollectionBySlug } from "@/lib/collections";
import Reveal from "@/components/reveal";

export const metadata: Metadata = {
  title: "Curate Your Hamper",
  description:
    "Build something personal from our collection — curation ideas, ready-to-gift combinations, and help putting together a hamper that feels just right.",
};

// Curation ideas: custom labels over existing shop collections (these edits were
// removed from the Shop dropdown and surfaced here instead).
const CURATION_IDEAS: { label: string; slug: string }[] = [
  { label: "The Bridesmaid Edit", slug: "for-your-bridesmaids" },
  { label: "For Two", slug: "for-couples" },
  { label: "The Corporate Edit", slug: "for-corporate" },
  { label: "The Baby Shower Edit", slug: "for-a-babyshower-event" },
];

// TODO: replace with the real enquiry inbox (the spec showed a Gmail address).
const ENQUIRY_EMAIL = "hello@littlecco.art";

function StepArrow() {
  return (
    <div className="flex justify-center py-8 md:py-10" aria-hidden="true">
      <svg width="20" height="34" viewBox="0 0 20 34" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-black/30">
        <path d="M10 1v30" />
        <path d="m2 24 8 8 8-8" />
      </svg>
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-8 md:mb-10">
      <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-(family-name:--font-body) text-[1.9rem] leading-tight text-black md:text-[2.4rem]">
        {title}
      </h2>
    </div>
  );
}

export default function CurateYourHamperPage() {
  return (
    <main className="min-h-screen">
      {/* 1 — Hero */}
      <Reveal as="section" className="border-b border-black/10 bg-[#f7f2ea]">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:px-8 md:py-24">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
            Gifting
          </p>
          <h1 className="mt-4 font-(family-name:--font-body) text-[2.5rem] leading-[1.05] text-black md:text-[3.6rem] lg:text-[4rem]">
            Curate Your <span className="font-(family-name:--font-heading)">Hamper</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl font-(family-name:--font-body) text-[1.05rem] leading-8 text-black/72 md:text-[1.15rem]">
            Build something personal from our collection.
          </p>
          <div className="mt-9">
            <Link
              href="#curation-ideas"
              className="button-soft inline-flex h-12 items-center justify-center bg-black px-7 font-(family-name:--font-body) text-base text-white transition-colors hover:bg-[#1a1a1a]"
            >
              Start with an idea
            </Link>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto max-w-7xl px-6 sm:px-8 md:px-16">
        {/* 2 — Curation ideas */}
        <Reveal as="section" id="curation-ideas" className="scroll-mt-28 pt-14 md:pt-20">
          <SectionHeading eyebrow="Curation ideas" title="Need a little inspiration?" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {CURATION_IDEAS.map((idea) => {
              const collection = getCollectionBySlug(idea.slug);
              return (
                <Link
                  key={idea.slug}
                  href={`/shop/${idea.slug}`}
                  className="lift-card group flex flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9]"
                >
                  <div className="aspect-[4/5] overflow-hidden bg-[#f3ede2]">
                    {collection?.image ? (
                      <img
                        src={collection.image}
                        alt={idea.label}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    ) : null}
                  </div>
                  <div className="border-t border-black/8 px-4 py-4">
                    <p className="font-(family-name:--font-body) text-[1.02rem] leading-6 text-[#181411]">
                      {idea.label}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>

        <StepArrow />

        {/* 3 — Ready to gift */}
        <Reveal as="section" className="pt-2">
          <SectionHeading eyebrow="Ready to gift" title="Our thoughtfully pre-curated combinations." />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="flex flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9]"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-[#f3ede2]">
                  <span className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/35">
                    Coming soon
                  </span>
                </div>
                <div className="border-t border-black/8 px-4 py-4">
                  <p className="font-(family-name:--font-body) text-[1.02rem] leading-6 text-[#181411]">
                    Premade Hamper {n}
                  </p>
                  <p className="mt-1 font-(family-name:--font-body) text-sm text-black/50">
                    Details coming soon.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        <StepArrow />

        {/* 4 — Need a little help */}
        <Reveal as="section" className="mb-16 border-t border-black/10 pt-14 md:mb-24 md:pt-20">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
            Need a little help?
          </p>
          <h2 className="mt-3 max-w-2xl font-(family-name:--font-body) text-[1.9rem] leading-tight text-black md:text-[2.4rem]">
            Your occasion. <span className="font-(family-name:--font-heading)">Our curation.</span>
          </h2>
          <p className="mt-5 max-w-2xl font-(family-name:--font-body) text-[1.02rem] leading-8 text-black/72">
            Tell us what you&rsquo;re celebrating, who it&rsquo;s for and your budget. We&rsquo;ll
            help you put together something that feels just right.
          </p>
          <a
            href={`mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent("Hamper enquiry")}`}
            className="button-soft mt-8 inline-flex h-12 items-center justify-center bg-black px-7 font-(family-name:--font-body) text-base text-white transition-colors hover:bg-[#1a1a1a]"
          >
            Get in touch
          </a>
        </Reveal>
      </div>
    </main>
  );
}
