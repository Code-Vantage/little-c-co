import { NextResponse } from "next/server";

// MapTiler geocoding proxy. The API key stays server-side and is never shipped
// to the browser. When MAPTILER_API_KEY is unset the route reports the feature
// as disabled so the client can fall back to a plain text input — checkout must
// never depend on this being configured.
const GEOCODE_URL = "https://api.maptiler.com/geocoding";
const UPSTREAM_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 300;
const MIN_QUERY_LENGTH = 3;

export type AddressSuggestion = {
  id: string;
  // Full label shown in the dropdown.
  label: string;
  // Street/line-1 portion, used to fill Address Line 1.
  line1: string;
  city: string;
  state: string;
  postcode: string;
};

type CacheEntry = { value: AddressSuggestion[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function readCache(key: string): AddressSuggestion[] | undefined {
  const entry = cache.get(key);
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt < Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeCache(key: string, value: AddressSuggestion[]) {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

type MapTilerContext = {
  id?: string;
  text?: string;
};

type MapTilerFeature = {
  id?: string;
  text?: string;
  place_name?: string;
  place_type?: string[];
  address?: string;
  context?: MapTilerContext[];
};

// MapTiler encodes administrative hierarchy in `context`, keyed by id prefix
// (postal_code.*, place.*, region.*). Pull out the parts we need for the form.
function readContext(feature: MapTilerFeature, prefix: string): string {
  const match = feature.context?.find((entry) => entry.id?.startsWith(`${prefix}.`));
  return (match?.text ?? "").trim();
}

function toSuggestion(feature: MapTilerFeature, index: number): AddressSuggestion | null {
  const label = (feature.place_name ?? feature.text ?? "").trim();
  if (!label) {
    return null;
  }

  const street = (feature.text ?? "").trim();
  const houseNumber = (feature.address ?? "").trim();
  const line1 = [houseNumber, street].filter(Boolean).join(" ").trim();

  return {
    id: feature.id ?? `${index}-${label}`,
    label,
    line1: line1 || label.split(",")[0].trim(),
    city: readContext(feature, "municipality") || readContext(feature, "place"),
    state: readContext(feature, "region"),
    postcode: readContext(feature, "postal_code"),
  };
}

export async function GET(request: Request) {
  const apiKey = process.env.MAPTILER_API_KEY;

  // Feature is optional. Tell the client to degrade rather than erroring.
  if (!apiKey) {
    return NextResponse.json({ disabled: true, suggestions: [] });
  }

  const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (query.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ suggestions: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = readCache(cacheKey);
  if (cached) {
    return NextResponse.json({ suggestions: cached });
  }

  const url = new URL(`${GEOCODE_URL}/${encodeURIComponent(query)}.json`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("country", "in");
  url.searchParams.set("language", "en");
  url.searchParams.set("limit", "6");
  url.searchParams.set("types", "address,poi,street,postal_code,municipality,place");

  let features: MapTilerFeature[];
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Upstream responded ${response.status}`);
    }
    const payload = (await response.json()) as { features?: MapTilerFeature[] };
    features = payload.features ?? [];
  } catch {
    // Provider outage must not block checkout — return an empty list and let
    // the customer type the address by hand.
    return NextResponse.json({ suggestions: [], unavailable: true });
  }

  const suggestions = features
    .map(toSuggestion)
    .filter((item): item is AddressSuggestion => item !== null);

  writeCache(cacheKey, suggestions);
  return NextResponse.json({ suggestions });
}
