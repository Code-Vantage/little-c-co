import type { StoreProduct } from "@/lib/types";

const baseUrl = process.env.WOOCOMMERCE_SITE_URL?.replace(/\/$/, "");
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;
// WordPress Application Password (separate from Woo REST keys) for media uploads,
// since /wp/v2/media does not accept WooCommerce consumer keys.
const wpAppUser = process.env.WP_APP_USER;
const wpAppPassword = process.env.WP_APP_PASSWORD;

export function isWooConfigured() {
  return Boolean(baseUrl && consumerKey && consumerSecret);
}

export function isMediaUploadConfigured() {
  return Boolean(baseUrl && wpAppUser && wpAppPassword);
}

export function getWooSiteUrl() {
  if (!baseUrl) {
    throw new Error("WOOCOMMERCE_SITE_URL is not configured.");
  }

  return baseUrl;
}

function getBasicAuthHeader() {
  if (!consumerKey || !consumerSecret) {
    return "";
  }

  const token = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  return `Basic ${token}`;
}

export async function wooRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!baseUrl) {
    throw new Error("WOOCOMMERCE_SITE_URL is not configured.");
  }

  const authHeader = getBasicAuthHeader();

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(authHeader ? { Authorization: authHeader } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`WooCommerce request failed (${response.status}): ${errorText}`);
  }

  return (await response.json()) as T;
}

// Upload a binary file to the WordPress media library. Uses the same Basic Auth
// credentials as wooRequest but sends the raw file body (not JSON).
export async function wooUploadMedia(
  file: ArrayBuffer,
  filename: string,
  mimeType: string,
): Promise<{ url: string }> {
  if (!baseUrl) {
    throw new Error("WOOCOMMERCE_SITE_URL is not configured.");
  }

  if (!wpAppUser || !wpAppPassword) {
    throw new Error(
      "Media uploads require WP_APP_USER and WP_APP_PASSWORD (a WordPress Application Password).",
    );
  }

  const authHeader = `Basic ${Buffer.from(`${wpAppUser}:${wpAppPassword}`).toString("base64")}`;

  const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      Authorization: authHeader,
      "Content-Type": mimeType,
      "Content-Disposition": `attachment; filename="${filename.replace(/"/g, "")}"`,
    },
    body: file,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Media upload failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as { source_url?: string; guid?: { rendered?: string } };
  const url = data.source_url || data.guid?.rendered;
  if (!url) {
    throw new Error("Media upload did not return a URL.");
  }
  return { url };
}

type WooProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  stock_status: string;
  images: Array<{ src: string; alt: string }>;
  categories: Array<{ id: number; name: string; slug: string }>;
  attributes?: Array<{ name: string; options?: string[] }>;
  meta_data?: Array<{ key: string; value: unknown }>;
};

function readCustomizationType(product: WooProduct): string | undefined {
  const meta = product.meta_data?.find((entry) => entry.key === "customization_type");
  const value = meta?.value;
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }
  return undefined;
}

export function normalizeWooProduct(product: WooProduct): StoreProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    shortDescription: product.short_description,
    price: product.price,
    regularPrice: product.regular_price,
    stockStatus: product.stock_status,
    images: product.images ?? [],
    categories: (product.categories ?? []).map((c) => c.name),
    attributes: (product.attributes ?? [])
      .filter((attribute) => attribute.name && (attribute.options?.length ?? 0) > 0)
      .map((attribute) => ({
        name: attribute.name,
        options: attribute.options ?? [],
      })),
    customizationType: readCustomizationType(product),
  };
}
