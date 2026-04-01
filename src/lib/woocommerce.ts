import type { StoreProduct } from "@/lib/types";

const baseUrl = process.env.WOOCOMMERCE_SITE_URL?.replace(/\/$/, "");
const consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

export function isWooConfigured() {
  return Boolean(baseUrl && consumerKey && consumerSecret);
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
};

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
  };
}
