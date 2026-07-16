import Image from "next/image";

export default function HeroSlideshow() {
  return (
    <div className="relative min-h-[34rem] overflow-hidden bg-[#1c1711] text-white sm:aspect-[3509/2260] sm:min-h-0">
      <Image
        src="/moodboard.webp"
        alt="Elegant, timeless handmade creations by little c co."
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
    </div>
  );
}
