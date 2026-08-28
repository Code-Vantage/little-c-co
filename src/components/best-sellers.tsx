import { getProducts } from "@/lib/products";
import { getFromPrice } from "@/lib/pricing";
import type { StoreProduct } from "@/lib/types";

function ProductCard({ product }: { product: StoreProduct }) {
  const image = product.images[0];
  const fromPrice = getFromPrice(product.slug);
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <a
      href={`/products/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9] shadow-[0px_12px_28px_rgba(15,23,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:border-[#cfc5b7] hover:shadow-[0px_20px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-full flex-col">
        {/* Product image */}
        <div className="bg-white p-2.5 sm:p-3">
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

        <div className="flex flex-1 flex-col justify-between border-t border-black/8 px-3.5 pb-3.5 pt-4 sm:px-4 sm:pb-4">
          <div>
            <p className="line-clamp-2 min-h-[3.4rem] font-(family-name:--font-body) text-[1.08rem] leading-7 text-[#181411]">
              {product.name}
            </p>
          </div>

          <div className="mt-4 flex items-end gap-2">
            {fromPrice !== null ? (
              <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">
                From ₹{fromPrice.toLocaleString("en-IN")}
              </span>
            ) : (
              <>
                <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">
                  ₹{salePrice}
                </span>
                <span className="relative mb-0.5 pb-0.5 font-(family-name:--font-body) text-[0.92rem] text-black/40">
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

export default async function BestSellers() {
  const products = await getProducts();
  const featured = products.slice(0, 6);

  return (
    <section aria-label="Best Sellers" className="px-6 py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-7xl">
        {/* Heading with decorative curl */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-4 mb-10 md:mb-12">
          <h2 className="font-(family-name:--font-heading) text-4xl md:text-5xl text-black whitespace-nowrap text-center md:text-left">   
            Best Sellers
          </h2>
          {/* Hand-drawn curl line */}
          {/* <img src="/bestseller_line.svg" alt="" /> */}
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14"> 
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
