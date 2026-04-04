export const dynamic = "force-dynamic";
import { getProducts } from "@/lib/products";
import type { StoreProduct } from "@/lib/types";

function normalizeSearchValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0]?.trim().toLowerCase() || "";
  }

  return value?.trim().toLowerCase() || "";
}

function productMatchesQuery(product: StoreProduct, query: string) {
  if (!query) {
    return true;
  }

  const fields = [
    product.name,
    product.description,
    product.shortDescription,
    product.slug.replace(/-/g, " "),
    ...(product.categories ?? []),
    ...((product.attributes ?? []).flatMap((attribute) => [attribute.name, ...attribute.options])),
  ];

  return fields.some((field) => field.toLowerCase().includes(query));
}

function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <a
      href={`/products/${product.slug}`}
      className="relative block bg-[#fbf3e0] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-[0px_6px_16px_0px_rgba(0,0,0,0.18)] transition-shadow"
    >
      {/* Dashed inner border overlay */}
      <div className="absolute inset-1 sm:inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none z-10" />

      <div className="p-2 sm:p-3.5">
        {/* Product image */}
        <div className="border border-[#d2bc70] overflow-hidden">
          {image ? (
            <img
              src={image.src}
              alt={image.alt || product.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <div className="w-full aspect-square bg-[#f0e6c8]" />
          )}
        </div>

        {/* Name */}
        <p className="font-(family-name:--font-body) text-base sm:text-lg text-black mt-2.5 truncate">
          {product.name}
        </p>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-0.5 mb-1.5">
          <span className="text-base sm:text-lg text-black font-normal">
            ₹{salePrice}
          </span>
            <span className="relative text-base sm:text-lg text-[#666]">
              {regularPrice}
              <span className="absolute left-0 top-1/2 w-full border-t border-[#666]" />
            </span>
        </div>
      </div>
    </a>
  );
}

function CategorySection({ name, products }: { name: string; products: StoreProduct[] }) {
  return (
    <section aria-label={name} className="mb-16 md:mb-30">
      <h2 className="font-heading text-3xl md:text-4xl text-black mb-4 md:mb-6">{name}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-6 md:gap-x-6 md:gap-y-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = normalizeSearchValue(resolvedSearchParams.q ?? resolvedSearchParams.query);

  const products = await getProducts();
  const visibleProducts = products.filter((product) => productMatchesQuery(product, query));

  // Group products by category, preserving first-seen order
  const categoryMap = new Map<string, StoreProduct[]>();
  for (const product of visibleProducts) {
    const cats = product.categories?.length ? product.categories : ["Uncategorized"];
    for (const cat of cats) {
      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(product);
    }
  }

  const categories = Array.from(categoryMap.entries());

  return (
    <main className="bg-[#f5f0e8] min-h-screen px-4 sm:px-8 py-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-6xl">
        {query && (
          <div className="mb-8">
            <h1 className="font-heading text-4xl text-black">Search Results</h1>
            <p className="mt-2 font-(family-name:--font-body) text-base text-black/70">
              Showing results for &quot;{query}&quot;.
            </p>
          </div>
        )}

        {categories.length > 0 ? (
          categories.map(([name, items]) => (
            <CategorySection key={name} name={name} products={items} />
          ))
        ) : (
          <section aria-label="No products found" className="mb-8">
            <h2 className="font-heading text-3xl text-black">No products found</h2>
            <p className="mt-2 font-(family-name:--font-body) text-base text-black/70">
              Try a different search term or browse all products.
            </p>
            <a
              href="/shop"
              className="mt-4 inline-flex h-11 items-center justify-center bg-black px-5 text-white font-(family-name:--font-body) text-base hover:bg-[#1a1a1a] transition-colors"
            >
              View all products
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
