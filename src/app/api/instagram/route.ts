import { NextResponse } from "next/server";

export const revalidate = 3600; // Re-fetch at most once per hour

interface InstagramPost {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
}

async function refreshToken(token: string): Promise<string> {
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
    { cache: "no-store" }
  );
  if (!res.ok) return token; // silently keep old token if refresh fails
  const data = await res.json();
  return (data.access_token as string) ?? token;
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!token) {
    return NextResponse.json(
      { error: "INSTAGRAM_ACCESS_TOKEN is not set" },
      { status: 500 }
    );
  }

  // Refresh the token so it never expires (valid 60 days, refreshed on each hourly revalidation)
  const freshToken = await refreshToken(token);

  const fields = "id,media_type,media_url,thumbnail_url,permalink,caption";
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=${fields}&limit=3&access_token=${freshToken}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    const err = await res.json();
    return NextResponse.json(
      { error: "Instagram API error", detail: err },
      { status: res.status }
    );
  }

  const data = await res.json();
  const posts: InstagramPost[] = (data.data ?? []).map((p: InstagramPost) => ({
    id: p.id,
    media_type: p.media_type,
    // Videos expose a thumbnail_url; images use media_url directly
    media_url: p.media_type === "VIDEO" ? (p.thumbnail_url ?? p.media_url) : p.media_url,
    permalink: p.permalink,
    caption: p.caption ?? "",
  }));

  return NextResponse.json(posts);
}
