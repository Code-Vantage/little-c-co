import { getProductBySlug, getProducts } from "@/lib/products";
import { notFound } from "next/navigation";
import ProductDetailClient from "./_product-client";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [product, allProducts] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
  ]);

  if (!product) notFound();

  const related = allProducts.filter((p) => p.slug !== product.slug).slice(0, 8);

  return <ProductDetailClient product={product} related={related} />;
}
