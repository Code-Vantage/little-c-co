import Image from "next/image";
import Reveal from "@/components/reveal";

const categories = [
  {
    name: "Cake knife & server",
    label: "Cake knife &\nserver",
    image: "/categories/cake.webp",
  },
  {
    name: "Perfume bottle",
    label: "Perfume\nbottle",
    image: "/categories/perfume.webp",
  },
  {
    name: "Wine glass & bottle",
    label: "Wine glass &\nbottle",
    image: "/categories/wineglass.webp",
  },
  {
    name: "Letter",
    label: "Letter",
    image: "/categories/letter.webp",
  },
  {
    name: "Place cards",
    label: "Place cards",
    image: "/categories/placecards.webp",
  },
  {
    name: "Signage",
    label: "Signage",
    image: "/categories/signage.webp",
  },
] as const;

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

        <div className="overflow-x-auto px-2 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max items-end justify-center gap-10 sm:gap-12 md:gap-14">
            {categories.map((category) => (
              <div
                key={category.name}
                className="lift-card flex w-28 flex-none flex-col items-center text-center sm:w-31 lg:w-34"
              >
                <div className="relative flex h-28 w-full items-center justify-center overflow-hidden sm:h-31 lg:h-34">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={280}
                    height={280}
                    sizes="(min-width: 1280px) 136px, (min-width: 640px) 124px, 112px"
                    className="media-soft h-full w-full object-contain p-0.5 drop-shadow-[0_8px_14px_rgba(0,0,0,0.07)]"
                    priority={category.name === "Cake knife & server"}
                  />
                </div>
                <p className="mt-1.5 max-w-[12ch] whitespace-pre-line text-center font-(family-name:--font-heading) text-[1rem] leading-[1.02] tracking-[0.02em] text-black sm:text-[1.08rem]">
                  {category.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
