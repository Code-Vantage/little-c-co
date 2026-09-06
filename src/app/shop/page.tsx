export const dynamic = "force-dynamic";
import { getProducts } from "@/lib/products";
import { getFromPrice } from "@/lib/pricing";
import type { StoreProduct } from "@/lib/types";

const uncategorizedLabel = "Gifts & Keepsakes";
const categoryOrder = [uncategorizedLabel, "The Table Edit"];

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
  const fromPrice = getFromPrice(product.slug);
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <a
      href={`/products/${product.slug}`}
      className="lift-card group flex h-full flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9] shadow-[0px_12px_28px_rgba(15,23,42,0.07)] transition-all duration-300 hover:border-[#cfc5b7] hover:shadow-[0px_20px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-full flex-col">
        {/* Product image */}
        <div className="bg-white p-2 sm:p-3">
          {image ? (
            <div className="flex aspect-[4/5] items-center justify-center overflow-hidden bg-white">
              <img
                src={image.src}
                alt={image.alt || product.name}
                className="h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          ) : (
            <div className="aspect-[4/5] w-full bg-[#f3ede2]" />
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between border-t border-black/8 px-2.5 pb-2.5 pt-3 sm:px-4 sm:pb-4 sm:pt-4">
          <div>
            <p className="line-clamp-2 min-h-[3.2rem] font-(family-name:--font-body) text-base leading-6 text-[#181411] sm:min-h-[3.4rem] sm:text-[1.05rem] sm:leading-7">
              {product.name}
            </p>
          </div>

          <div className="mt-3 sm:mt-4 flex items-end gap-2">
            {fromPrice !== null ? (
              <span className="font-(family-name:--font-body) text-lg leading-none text-[#181411] sm:text-[1.35rem]">
                From ₹{fromPrice.toLocaleString("en-IN")}
              </span>
            ) : (
              <>
                <span className="font-(family-name:--font-body) text-lg leading-none text-[#181411] sm:text-[1.35rem]">
                  ₹{salePrice}
                </span>
                <span className="relative mb-0.5 pb-0.5 font-(family-name:--font-body) text-[0.78rem] text-black/40 sm:text-[0.92rem]">
                  ₹{regularPrice}
                  <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}

function CategorySection({ name, products }: { name: string; products: StoreProduct[] }) {
  return (
    <section aria-label={name} className="mb-14 border-t border-black/10 pt-6 md:mb-18 md:pt-8">
      <div className="mb-5 flex flex-col gap-2 md:mb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="mt-1 font-(family-name:--font-body) text-[1.8rem] leading-tight text-black md:text-[2.2rem]">
            {name}
          </h2>
        </div>
        <p className="font-(family-name:--font-body) text-sm text-black/50">
          {products.length} item{products.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="grid grid-cols-2 justify-items-center gap-x-5 gap-y-7 md:grid-cols-4 md:gap-x-7 md:gap-y-9 lg:gap-x-10 lg:gap-y-12">
        {products.map((product) => (
          <div key={product.id} className="w-full max-w-[16.5rem] sm:max-w-[17.5rem] lg:max-w-[20rem]">
            <ProductCard product={product} />
          </div>
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

  // Group products by category, then show the keepsake and table edits first.
  const categoryMap = new Map<string, StoreProduct[]>();
  for (const product of visibleProducts) {
    const cats = product.categories?.length ? product.categories : ["Uncategorized"];
    for (const cat of cats) {
      const categoryName = cat === "Uncategorized" ? uncategorizedLabel : cat;
      if (!categoryMap.has(categoryName)) categoryMap.set(categoryName, []);
      categoryMap.get(categoryName)!.push(product);
    }
  }

  const categories = Array.from(categoryMap.entries()).sort(([a], [b]) => {
    const aPosition = categoryOrder.indexOf(a);
    const bPosition = categoryOrder.indexOf(b);

    return (
      (aPosition === -1 ? categoryOrder.length : aPosition) -
      (bPosition === -1 ? categoryOrder.length : bPosition)
    );
  });

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 md:px-16 md:py-16">
      <div className="mx-auto max-w-7xl">
      <div className="mb-10 max-w-3xl md:mb-12">
        {query && (
          <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
            Search
          </p>
        )}
        {query ? (
          <h1 className="mt-3 font-(family-name:--font-body) text-[2.35rem] leading-tight text-black md:text-[3.2rem]">
            Search <span className="font-(family-name:--font-heading)">results</span>
          </h1>
        ) : (
          <h1 className="font-(family-name:--font-body) text-[2.35rem] leading-tight text-black md:text-[3.2rem]">
            <span className="font-(family-name:--font-heading)">Shop</span>
          </h1>
        )}
        <p className="mt-3 font-(family-name:--font-body) text-[1rem] leading-7 text-black/70 md:text-[1.08rem]">
          {query
              ? `Showing results for "${query}".`
              : "Explore handcrafted pieces across gifting, keepsakes, stationery, and event details."}
          </p>
        </div>

        {categories.length > 0 ? (
          categories.map(([name, items]) => (
            <CategorySection key={name} name={name} products={items} />
          ))
        ) : (
          <section aria-label="No products found" className="mb-8 border-t border-black/10 pt-6 md:pt-8">
            <h2 className="font-(family-name:--font-body) text-[1.8rem] leading-tight text-black md:text-[2.2rem]">No products found</h2>
            <p className="mt-3 font-(family-name:--font-body) text-base text-black/70">
              Try a different search term or browse all products.
            </p>
            <a
              href="/shop"
              className="button-soft mt-4 inline-flex h-11 items-center justify-center bg-black px-5 text-white font-(family-name:--font-body) text-base hover:bg-[#1a1a1a] transition-colors"
            >
              View all products
            </a>
          </section>
        )}
      </div>
    </main>
  );
}
