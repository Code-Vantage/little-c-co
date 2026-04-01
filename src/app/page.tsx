export const dynamic = "force-dynamic";
import Image from "next/image";
import About from "@/components/about";
import BestSellers from "@/components/best-sellers";
import LiveEvents from "@/components/live-events";
import Instagram from "@/components/instagram";

export default function HomePage() {
  return (
    <main>
      <section aria-label="Hero">
        <Image
          src="/moodboard.png"
          alt="Elegant, timeless handmade creations by little c co."
          width={1920}
          height={1080}
          priority
          className="w-full h-auto block"
        />
      </section>
      <About />
      <BestSellers />
      <LiveEvents />
      <Instagram />
    </main>
  );
}
