const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/littlecmakes/";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
}

async function getPosts(): Promise<InstagramPost[]> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    const res = await fetch(`${baseUrl}/api/instagram`, {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Instagram() {
  const posts = await getPosts();

  return (
    <section aria-label="Follow us on Instagram" className="px-6 py-14 md:px-16 md:py-18">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl text-center md:text-left">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
              Instagram
            </p>
            <h2 className="mt-3 font-(family-name:--font-heading) text-4xl text-black md:text-5xl">
              Glimpses of recent work
            </h2>
            <p className="mt-3 max-w-2xl font-(family-name:--font-body) text-[1rem] leading-7 text-black/72 md:text-[1.08rem]">
              A collection of finished pieces, event details, and small moments from the studio.
            </p>
          </div>
          <div className="flex justify-center md:block">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center justify-center border border-black/15 px-5 font-(family-name:--font-body) text-sm text-black transition-colors hover:border-black hover:bg-black hover:text-white"
            >
              View Instagram
            </a>
          </div>
        </div>

        {posts.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {posts.map((post, i) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={`group block overflow-hidden transition-transform duration-300 hover:-translate-y-0.5 ${i > 0 ? "hidden sm:block" : ""}`}
              >
                <div className="overflow-hidden bg-[#f3ede2]">
                  <img
                    src={post.media_url}
                    alt={post.caption ? post.caption.slice(0, 80) : "Instagram post"}
                    className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${i > 0 ? "hidden sm:block" : ""}`}
              >
                <div className="aspect-[4/5] w-full bg-[#e8e0d0]" />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
