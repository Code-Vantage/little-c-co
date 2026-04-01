export default function About() {
  return (
    <section id="about" aria-label="About" className="overflow-hidden py-50 px-6 my-10 scroll-mt-28">
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-24 md:flex-row md:items-start md:gap-20">

        {/* Left: polaroid card with botanicals */}
        <div className="relative shrink-0 self-start ml-8 md:ml-16">

          {/* Cherry blossom — large, extends from top-left, flipped vertically */}
          <img
            src="/tree1.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-45 -left-65 w-140 max-w-none z-10 pointer-events-none select-none"
            // style={{ width: 400 }}
          />

          {/* Tape — slightly right of center */}
          <img
            src="/tape.png"
            alt=""
            aria-hidden="true"
            className="absolute -top-28 left-[50%] -translate-x-1/2 w-60 z-30 pointer-events-none select-none rotate-2"
          />

          {/* Polaroid frame */}
          <div className="relative bg-[#fff9f1] p-4 pt-5 pb-20 shadow-[0px_0px_38px_0px_rgba(0,0,0,0.36)] z-20 w-85 md:w-100">
            {/* Dashed inner border with subtle shadow */}
            <div className="absolute inset-1 border-2 border-dashed border-[#93a267] pointer-events-none z-10" />

            {/* Video */}
            <div className="relative z-5 overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full object-cover mb-[-10%]"
              >
                <source src="/founder.webm" type="video/webm" />
              </video>
            </div>

            {/* Owner name label */}
            <p className="font-heading absolute bottom-6 left-6 text-2xl font-bold text-black z-10">
              Oshean Gupta
            </p>
          </div>

          {/* Lavender flowers — two sprigs at bottom-right */}
          <img
            src="/tree2.png"
            alt=""
            aria-hidden="true"
            className="absolute bottom-0 right-0 w-56 z-20 pointer-events-none select-none"
          />
        </div>

        {/* Right: text content */}
        <div className="flex flex-col gap-20 justify-center text-left pt-0 md:pt-14">
          <h2 className="font-heading text-4xl md:text-5xl text-black">
            Little C.Co
          </h2>

          <p className="font-(family-name:--font-body) max-w-xl text-[1.35rem] leading-8.25 tracking-[0.44px] text-black">
            Hello ! I’m Oshean, the hands behind Little c co. I specialize in modern, elegant calligraphy for weddings, dinners, and curated events. After years of gifting hand-lettered art to friends and family, I realized I wanted to help others turn their special moments into lasting memories. I’m so glad you’re here — let’s create something beautiful together.
          </p>
        </div>

      </div>
    </section>
  );
}

