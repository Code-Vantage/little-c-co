import Reveal from "@/components/reveal";

export default function About() {
  return (
    <Reveal as="section" id="about" aria-label="About" className="overflow-hidden px-6 py-14 md:py-18 scroll-mt-28" delay={80}>
      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-10 md:flex-row md:items-center md:gap-16">

        {/* Mobile Title (Displays above video on small screens) */}
        <h2 className="font-(family-name:--font-heading) text-4xl text-black md:hidden w-full text-center -mb-6">
          Little c co.
        </h2>

        {/* Left: polaroid card with botanicals */}
        <div className="relative shrink-0 self-center md:self-start ml-0 md:ml-6 w-full max-w-[300px] md:max-w-none md:w-auto">

          {/* Cherry blossom — large, extends from top-left, flipped vertically */}
          {/* <img
            src="/tree1.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-45 -left-65 w-140 max-w-none z-10 pointer-events-none select-none"
          /> */}

          {/* Tape — slightly right of center */}
          <img
            src="/tape.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-18 md:-top-28 left-[50%] -translate-x-1/2 w-40 md:w-60 z-30 pointer-events-none select-none rotate-2"
          />

          {/* Polaroid frame */}
          <div className="lift-card relative z-20 w-full bg-[#fff9f1] p-3 pb-16 pt-4 shadow-[0px_0px_38px_0px_rgba(0,0,0,0.36)] md:w-[25rem] md:p-4 md:pb-20 md:pt-5 lg:w-[28rem]">
            {/* Dashed inner border with subtle shadow */}
            {/* <div className="absolute inset-1 border-2 border-dashed border-[#93a267] pointer-events-none z-10" /> */}

            {/* Video */}
            <div className="relative z-5 overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="media-soft mb-[-10%] w-full object-cover"
              >
                <source src="/founder.webm" type="video/webm" />
              </video>
            </div>

            {/* Owner name label */}
            {/* <p className="absolute bottom-6 left-6 text-2xl font-bold text-black z-10">
              Oshean Gupta
            </p> */}
          </div>

          {/* Lavender flowers — two sprigs at bottom-right */}
          {/* <img
            src="/tree2.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-44 md:w-56 z-20 pointer-events-none select-none"
          /> */}
        </div>

        {/* Right: text content */}
        <div className="flex max-w-xl lg:max-w-2xl flex-col gap-5 md:gap-7 justify-center text-center md:text-left pt-0 md:pt-6">
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45 hidden md:block">
            About the studio
          </p>
          <h2 className="font-(family-name:--font-heading) text-5xl text-black hidden md:block">
            Little c co.
          </h2>

          <p className="font-(family-name:--font-body) text-[1.05rem] md:text-[1.22rem] leading-7 md:leading-8 tracking-[0.32px] text-black/85">
            Hello ! I’m Oshean, the hands behind Little c co. I specialize in modern, elegant calligraphy for weddings, dinners, and curated events. After years of gifting hand-lettered art to friends and family, I realized I wanted to help others turn their special moments into lasting memories. I’m so glad you’re here — let’s create something beautiful together.
          </p>
        </div>

      </div>
    </Reveal>
  );
}
