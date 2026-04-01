import { getProducts } from "@/lib/products";
import type { StoreProduct } from "@/lib/types";

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
      <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none z-10" />

      <div className="p-3.5">
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
        <p className="font-(family-name:--font-body) text-lg text-black mt-2.5 truncate">
          {product.name}
        </p>

        {/* Pricing */}
        <div className="flex items-center gap-2 mt-0.5 mb-1.5">
          <span className="text-lg text-black font-normal">
            ₹{salePrice}
          </span>
            <span className="relative text-lg text-[#666]">
              {regularPrice}
              <span className="absolute left-0 top-1/2 w-full border-t border-[#666]" />
            </span>
        </div>
      </div>
    </a>
  );
}

export default async function BestSellers() {
  const products = await getProducts();
  const featured = products.slice(0, 6);

  return (
    <section aria-label="Best Sellers" className="bg-[#f5f0e8] px-8 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Heading with decorative curl */}
        <div className="flex items-center gap-4 mb-12">
          <h2 className="font-heading text-5xl text-black whitespace-nowrap">
            Best Sellers
          </h2>
          {/* Hand-drawn curl line */}
          <img src="/bestseller_line.svg" alt="" />
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
