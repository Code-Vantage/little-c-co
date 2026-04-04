const liveEventsImage = "https://www.figma.com/api/mcp/asset/fd5a460a-89ff-4c50-98ca-621700953063";

const services = [
  "Service no 1",
  "Service no 2",
  "Service no 3",
  "Service no 4",
];

export default function LiveEvents() {
  return (
    <section
      aria-label="Live Events"
      className="bg-[#f5f0e8] px-6 py-12 md:px-16 md:py-20 overflow-hidden"     
    >
      <div className="mx-auto max-w-6xl">

        {/* Row 1: Heading */}
        <h2 className="font-heading text-4xl md:text-5xl text-black mb-6 text-center md:text-left">Live Events</h2>

        {/* Mobile-only Image (Between Title and Description) */}
        <div className="md:hidden flex justify-center w-full mt-8 mb-12">
          <div className="relative shrink-0 w-full max-w-[280px]">
            {/* Tape */}
            <img
              src="/tape.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-18 left-[50%] -translate-x-1/2 w-40 z-50 rotate-2 pointer-events-none select-none"
            />

            {/* Polaroid card */}
            <div className="relative bg-[#fff9f1] p-3 pt-4 pb-12 shadow-[0px_0px_38px_0px_rgba(0,0,0,0.36)] z-40 w-full mx-auto">
              <div className="overflow-hidden">
                <img
                  src={liveEventsImage}
                  alt="Live calligraphy event"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </div>

            {/* Botanicals */}
            <img
              src="/tree4.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 -left-12 w-36 z-30 pointer-events-none select-none"
            />
            <img
              src="/tree3.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 -right-8 rotate-12 w-28 z-30 pointer-events-none select-none"
            />
          </div>
        </div>

        {/* Row 2: Description */}
        <p className="font-(family-name:--font-body) text-[1.1rem] md:text-[1.2rem] leading-7 md:leading-8 tracking-[0.44px] text-black mb-10 md:mb-12 text-center md:text-left">
          Transform your event into a truly memorable experience with our
          exclusive on-site services. We bring the art of live personalization
          directly to your venue, creating beautifully crafted pieces in real
          time that captivate and engage your guests. Whether it&apos;s a corporate
          event, brand activation, wedding, or private celebration, our work
          adds a unique blend of creativity, elegance, and authenticity to
          every moment.
        </p>

        {/* Row 3: Two columns — Services | Polaroid */}
        <div className="flex flex-col-reverse md:flex-row items-center md:items-start gap-12 md:gap-40">

          {/* Left: Services + button */}
          <div className="flex-1 w-full md:w-auto min-w-0 text-center md:text-left">
            <h3 className="font-(family-name:--font-body) text-[1.75rem] md:text-[2rem] font-normal text-black mb-4 md:mb-0 tracking-[0.5px]">
              Services
            </h3>

            <ul className="mb-10 text-left">
              {services.map((service, i) => (
                <li key={i}>
                  <p className="font-(family-name:--font-body) text-[1.1rem] md:text-[1.2rem] tracking-[0.44px] text-black py-3 md:py-3.5">
                    {service}
                  </p>
                  <hr className="border-t border-black/30" />
                </li>
              ))}
            </ul>

            <button className="bg-black text-white font-(family-name:--font-body) text-base md:text-lg px-8 md:px-10 py-3 rounded-full hover:bg-black/80 transition-colors w-full sm:w-auto">
              Know More
            </button>
          </div>

          {/* Right: Polaroid with botanicals */}
          <div className="relative shrink-0 hidden md:block self-start mr-16 mt-0 w-auto">

            {/* Tape */}
            <img
              src="/tape.png"
              alt=""
              aria-hidden="true"
              className="absolute -top-24 left-[50%] -translate-x-1/2 w-52 z-50 rotate-2 pointer-events-none select-none"
            />

            {/* Polaroid card */}
            <div className="relative bg-[#fff9f1] p-4 pt-5 pb-14 shadow-[0px_0px_38px_0px_rgba(0,0,0,0.36)] z-40 w-80 mx-auto">
              {/* Dashed inner border */}
              {/* <div className="absolute inset-1 border-2 border-dashed border-[#93a267] pointer-events-none z-10" /> */}

              {/* Image */}
              <div className="overflow-hidden">
                <img
                  src={liveEventsImage}
                  alt="Live calligraphy event"
                  className="w-full aspect-[3/4] object-cover"
                />
              </div>
            </div>

            {/* Botanicals — bottom corners */}
            <img
              src="/tree4.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 -left-20 w-44 z-30 pointer-events-none select-none"
            />
            <img
              src="/tree3.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 -right-16 rotate-12 w-36 z-30 pointer-events-none select-none"
            />
          </div>

        </div>
      </div>
    </section>
  );
}
