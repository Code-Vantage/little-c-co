import type { StoreProduct } from "@/lib/types";
import { normalizeWooProduct, wooRequest } from "@/lib/woocommerce";

function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, "").trim();
}

export async function getProducts(): Promise<StoreProduct[]> {
  try {
    const products = await wooRequest<Array<{
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
    }>>("/wp-json/wc/v3/products?status=publish&per_page=100");

    return products.map((product) => {
      const normalized = normalizeWooProduct(product);
      return {
        ...normalized,
        description: stripHtml(normalized.description),
        shortDescription: stripHtml(normalized.shortDescription),
      };
    });
  } catch (error) {
    throw new Error(
      `Failed to fetch products from WooCommerce: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    );
  }
}

export async function getProductBySlug(slug: string): Promise<StoreProduct | null> {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
}
