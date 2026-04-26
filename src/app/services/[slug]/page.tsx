import Link from "next/link";
import { notFound } from "next/navigation";
import { getProducts } from "@/lib/products";
import { getServiceBySlug } from "@/lib/services";
import Reveal from "@/components/reveal";

export const dynamic = "force-dynamic";

function ProductCard({
  product,
}: {
  product: Awaited<ReturnType<typeof getProducts>>[number];
}) {
  const image = product.images[0];
  const salePrice = Number(product.price).toLocaleString("en-IN");
  const regularPrice = Number(product.regularPrice).toLocaleString("en-IN");

  return (
    <Link
      href={`/products/${product.slug}`}
      className="lift-card group flex h-full flex-col overflow-hidden border border-[#d8d1c7] bg-[#fffdf9] shadow-[0px_12px_28px_rgba(15,23,42,0.07)] transition-all duration-300 hover:border-[#cfc5b7] hover:shadow-[0px_20px_40px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-full flex-col">
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
          <p className="line-clamp-2 min-h-[3.4rem] font-(family-name:--font-body) text-[1.08rem] leading-7 text-[#181411]">
            {product.name}
          </p>
          <div className="mt-4 flex items-end gap-2">
            <span className="font-(family-name:--font-body) text-[1.35rem] leading-none text-[#181411]">
              ₹{salePrice}
            </span>
            <span className="relative mb-0.5 pb-0.5 font-(family-name:--font-body) text-[0.92rem] text-black/40">
              ₹{regularPrice}
              <span className="absolute left-0 top-1/2 w-full border-t border-black/30" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const products = await getProducts();
  const matchingProducts = products.filter((product) =>
    product.categories.some((category) => service.sourceCategories.includes(category)),
  );

  return (
    <main className="min-h-screen">
      <Reveal as="section" className="border-b border-black/10 bg-[#f7f2ea]">
        <div className="grid md:min-h-[22rem] md:grid-cols-[minmax(0,0.74fr)_minmax(26rem,1.26fr)] md:items-stretch lg:min-h-[24rem]">
          <div className="min-h-[12rem] overflow-hidden bg-[#f4ede1] md:min-h-full">
            <img
              src={service.image}
              alt={service.title}
              className="block h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-6 py-8 sm:px-8 md:px-12 md:py-12 lg:px-14">
            {/* <p className="mt-6 font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
              {service.label}
            </p> */}
            <h1 className="mt-3 font-(family-name:--font-body) text-[2.25rem] leading-tight text-black md:text-[3.15rem] lg:text-[3.6rem]">
              {service.title}
            </h1>
            <p className="mt-2 font-(family-name:--font-heading) text-[1.8rem] leading-none text-black/55 md:text-[2.4rem] lg:text-[2.7rem]">
              {service.eyebrow}
            </p>
            <p className="mt-5 max-w-2xl font-(family-name:--font-body) text-[1rem] leading-7 text-black/72 md:text-[1.05rem] lg:text-[1.1rem]">
              {service.description}
            </p>
            <div className="mt-8 grid gap-4 border-t border-black/10 pt-6 sm:grid-cols-2">
              <div>
                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                  {service.detailOneLabel}
                </p>
                <p className="mt-2 font-(family-name:--font-body) text-base leading-7 text-black/72">
                  {service.detailOneText}
                </p>
              </div>
              <div>
                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                  {service.detailTwoLabel}
                </p>
                <p className="mt-2 font-(family-name:--font-body) text-base leading-7 text-black/72">
                  {service.detailTwoText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="div" className="px-6 py-10 sm:px-8 md:px-16 md:py-16" delay={80}>
        <div className="mx-auto max-w-7xl">
          {matchingProducts.length > 0 ? (
          <section>
            <div className="mb-7 flex flex-col gap-2 md:mb-8 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
                  Products
                </p>
                <h2 className="mt-2 font-(family-name:--font-body) text-[1.8rem] leading-tight text-black md:text-[2.2rem]">
                  Featured in this service
                </h2>
              </div>
              <p className="font-(family-name:--font-body) text-sm text-black/50">
                {matchingProducts.length} item{matchingProducts.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid grid-cols-2 justify-items-center gap-x-5 gap-y-7 md:grid-cols-4 md:gap-x-7 md:gap-y-9 lg:gap-x-10 lg:gap-y-12">
              {matchingProducts.map((product) => (
                <div key={product.id} className="w-full max-w-[16.5rem] sm:max-w-[17.5rem] lg:max-w-[18.5rem]">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="border-t border-black/10 pt-8 md:pt-10">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
              Products
            </p>
            <h2 className="mt-2 font-(family-name:--font-body) text-[1.8rem] leading-tight text-black md:text-[2.2rem]">
              Featured pieces coming soon
            </h2>
            <p className="mt-4 max-w-2xl font-(family-name:--font-body) text-base leading-7 text-black/72">
              This service is currently presented as bespoke studio work. Product examples for this category will appear here as they are added to the collection.
            </p>
          </section>
        )}
        </div>
      </Reveal>
    </main>
  );
}
