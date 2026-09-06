import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/reveal";

const categories = [
  {
    name: "Cake knife & server",
    label: "Cake knife &\nserver",
    image: "/categories/cake.webp",
    href: "/products/personalised-cake-knife-server-set",
  },
  {
    name: "Wine glass",
    label: "Wine glass",
    image: "/categories/wine-glass.webp",
    href: "/products/personalised-wine-glass",
  },
  {
    name: "Compact mirror",
    label: "Compact\nmirror",
    image: "/categories/compact-mirror.png",
    href: "/products/personalised-compact-mirror",
  },
  {
    name: "Letter",
    label: "Letter",
    image: "/categories/letter.webp",
    href: "/products/handwritten-letter-in-an-engraved-glass-box",
  },
  {
    name: "Signage",
    label: "Signage",
    image: "/categories/signage.webp",
    href: "/products/handpainted-signage",
  },
  {
    name: "Personalised frame",
    label: "Personalised\nframe",
    image: "/categories/personalised-frame.webp",
    href: "/products/personalised-frame",
  },
  {
    name: "Hamper",
    label: "Hamper",
    image: "/categories/personalised-gifting.webp",
    href: "/curate-your-hamper",
  },
  {
    name: "Table details",
    label: "Table\ndetails",
    image: "/categories/placecards.webp",
    href: "/products/calligraphed-place-cards",
  },
] as const;

function CategoryCards({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div
      className="categories-group flex min-w-max items-end justify-center gap-10 pr-10 sm:gap-12 sm:pr-12 md:gap-14 md:pr-14"
      data-duplicate={duplicate ? "true" : undefined}
      aria-hidden={duplicate}
    >
      {categories.map((category) => (
        <Link
          key={`${duplicate ? "duplicate" : "primary"}-${category.name}`}
          href={category.href}
          tabIndex={duplicate ? -1 : undefined}
          className="lift-card flex w-28 flex-none flex-col items-center text-center sm:w-31 lg:w-34"
        >
          <div className="relative flex h-28 w-full items-center justify-center overflow-hidden sm:h-31 lg:h-34">
            <Image
              src={category.image}
              alt={duplicate ? "" : category.name}
              width={280}
              height={280}
              sizes="(min-width: 1280px) 136px, (min-width: 640px) 124px, 112px"
              className="media-soft h-full w-full object-contain p-0.5 drop-shadow-[0_8px_14px_rgba(0,0,0,0.07)]"
              priority={category.name === "Cake knife & server" && !duplicate}
            />
          </div>
          <p className="mt-2 max-w-[12ch] whitespace-pre-line text-center font-(family-name:--font-body) text-sm leading-[1.02] tracking-[0.02em] text-black/60 uppercase ">
            {category.label}
          </p>
        </Link>
      ))}
    </div>
  );
}

export default function CategoriesStrip() {
  return (
    <Reveal as="section" aria-label="Categories" className="px-4 py-14 sm:px-6 md:py-16" delay={60}>
      <div className="w-full">
        <div className="mb-6 text-center sm:mb-8">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.35em] text-black/45">
            Categories
          </p>
          <h2 className="mt-3 font-(family-name:--font-heading) text-3xl text-black sm:text-4xl">
            Handcrafted for every detail
          </h2>
        </div>

        <div className="categories-marquee relative mx-auto max-w-6xl overflow-hidden px-2 pb-2">
          <div className="categories-track flex w-max items-end">
            <CategoryCards />
            <CategoryCards duplicate />
          </div>
        </div>
      </div>
    </Reveal>
  );
}
