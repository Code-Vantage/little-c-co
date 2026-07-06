import Reveal from "@/components/reveal";

const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/littlecmakes/";

interface InstagramPost {
  id: string;
  media_url: string;
  permalink: string;
  caption?: string;
}

async function refreshToken(token: string): Promise<string> {
  try {
    const res = await fetch(
      `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
      { cache: "no-store" }
    );
    if (!res.ok) return token;
    const data = await res.json();
    return (data.access_token as string) ?? token;
  } catch {
    return token;
  }
}

async function getPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const freshToken = await refreshToken(token);
    const fields = "id,media_type,media_url,thumbnail_url,permalink,caption";
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=3&access_token=${freshToken}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []).map(
      (p: { id: string; media_type: string; media_url: string; thumbnail_url?: string; permalink: string; caption?: string }) => ({
        id: p.id,
        media_url: p.media_type === "VIDEO" ? (p.thumbnail_url ?? p.media_url) : p.media_url,
        permalink: p.permalink,
        caption: p.caption ?? "",
      })
    );
  } catch {
    return [];
  }
}

export default async function Instagram() {
  const posts = await getPosts();

  return (
    <Reveal as="section" aria-label="Follow us on Instagram" className="px-6 py-14 md:px-16 md:py-18" delay={140}>
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
              A collection of finished pieces, event details, and small moments.
            </p>
          </div>
          <div className="flex justify-center md:block">
            <a
              href={INSTAGRAM_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="button-soft inline-flex h-11 items-center justify-center border border-black/15 px-5 font-(family-name:--font-body) text-sm text-black transition-colors hover:border-black hover:bg-black hover:text-white"
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
                className={`lift-card group block overflow-hidden ${i > 0 ? "hidden sm:block" : ""}`}
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
    </Reveal>
  );
}
