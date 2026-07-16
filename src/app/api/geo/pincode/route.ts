import { NextResponse } from "next/server";

// India Post's public PIN code API. Keyless, but slow and occasionally flaky,
// so results are cached in-process and failures degrade to "no match" rather
// than surfacing an error into checkout.
const POSTAL_API = "https://api.postalpincode.in/pincode";
const UPSTREAM_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

export type PincodeResult = {
  city: string;
  state: string;
  district: string;
  // Distinct localities under this PIN, offered to the customer as City options.
  areas: string[];
};

type CacheEntry = { value: PincodeResult | null; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function readCache(pincode: string): CacheEntry | undefined {
  const entry = cache.get(pincode);
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt < Date.now()) {
    cache.delete(pincode);
    return undefined;
  }
  return entry;
}

function writeCache(pincode: string, value: PincodeResult | null) {
  // Bounded LRU-ish: drop the oldest insertion when full.
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) {
      cache.delete(oldest);
    }
  }
  cache.set(pincode, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

type PostOffice = {
  Name?: string;
  District?: string;
  State?: string;
  Block?: string;
};

type PostalResponse = Array<{
  Status?: string;
  PostOffice?: PostOffice[] | null;
}>;

export async function GET(request: Request) {
  const pincode = new URL(request.url).searchParams.get("pincode")?.trim() ?? "";

  if (!/^\d{6}$/.test(pincode)) {
    return NextResponse.json({ error: "A 6-digit PIN code is required." }, { status: 400 });
  }

  const cached = readCache(pincode);
  if (cached) {
    return cached.value
      ? NextResponse.json(cached.value)
      : NextResponse.json({ error: "No match for that PIN code." }, { status: 404 });
  }

  let payload: PostalResponse;
  try {
    const response = await fetch(`${POSTAL_API}/${pincode}`, {
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`Upstream responded ${response.status}`);
    }
    payload = (await response.json()) as PostalResponse;
  } catch {
    // Upstream down or slow. Don't cache — the PIN may well be valid.
    return NextResponse.json(
      { error: "PIN code lookup is unavailable right now." },
      { status: 503 },
    );
  }

  const offices = payload?.[0]?.PostOffice ?? [];
  if (payload?.[0]?.Status !== "Success" || offices.length === 0) {
    writeCache(pincode, null);
    return NextResponse.json({ error: "No match for that PIN code." }, { status: 404 });
  }

  const primary = offices[0];
  const district = (primary.District ?? "").trim();
  const areas = Array.from(
    new Set(
      offices
        .map((office) => (office.Name ?? "").trim())
        .filter((name): name is string => Boolean(name)),
    ),
  );

  const result: PincodeResult = {
    // WooCommerce expects a city; the district is the closest reliable analogue.
    city: district,
    state: (primary.State ?? "").trim(),
    district,
    areas,
  };

  writeCache(pincode, result);
  return NextResponse.json(result);
}
