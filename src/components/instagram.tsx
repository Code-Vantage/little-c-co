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
    <section
      aria-label="Follow us on Instagram"
      className="bg-[#f5f0e8] px-6 py-12 md:px-16 md:py-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <h2 className="font-heading text-4xl md:text-5xl text-black mb-8 md:mb-10 text-center md:text-left">
          Follow us on Instagram
        </h2>

        {/* 3-photo grid */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 md:mb-12">
            {posts.map((post, i) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className={`block overflow-hidden group ${i > 0 ? "hidden sm:block" : ""}`}
              >
                <img
                  src={post.media_url}
                  alt={post.caption ? post.caption.slice(0, 80) : "Instagram post"}
                  className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        ) : (
          // Fallback skeleton while token isn't configured
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10 md:mb-12">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-full aspect-square bg-[#e8e0d0] hidden sm:block lg:block first:block" />     
            ))}
          </div>
        )}

        {/* View Page button — centered */}
        <div className="flex justify-center">
          <a
            href={INSTAGRAM_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-black text-white font-(family-name:--font-body) text-base md:text-lg px-10 md:px-14 py-3 rounded-full hover:bg-black/80 transition-colors w-full sm:w-auto text-center"
          >
            View Page
          </a>
        </div>
      </div>
    </section>
  );
}
