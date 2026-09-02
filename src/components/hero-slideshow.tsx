import Image from "next/image";

export default function HeroSlideshow() {
  return (
    // Full-bleed moodboard shown whole at every width — never cropped.
    <div className="relative bg-[#1c1711] text-white">
      <Image
        src="/moodboard.webp"
        alt="Elegant, timeless handmade creations by little c co."
        width={8000}
        height={5656}
        priority
        sizes="100vw"
        className="h-auto w-full"
      />
    </div>
  );
}
