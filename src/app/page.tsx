export const dynamic = "force-dynamic";
import HeroSlideshow from "@/components/hero-slideshow";
import CategoriesStrip from "@/components/categories-strip";
import About from "@/components/about";
import Surfaces from "@/components/surfaces";
import EmailSignup from "@/components/email-signup";
import LiveEvents from "@/components/live-events";
import Instagram from "@/components/instagram";
import Reveal from "@/components/reveal";

export default function HomePage() {
  return (
    <main>
      <Reveal as="section" aria-label="Hero">
        <HeroSlideshow />
      </Reveal>
      <CategoriesStrip />
      <About />
      {/* <Surfaces /> */}
      <LiveEvents />
      <EmailSignup />
      <Instagram />
    </main>
  );
}
