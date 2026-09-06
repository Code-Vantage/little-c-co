import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/services";
import Reveal from "@/components/reveal";

export const dynamic = "force-dynamic";

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

  return (
    <main>
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
            {/* <h1 className="mt-3 font-(family-name:--font-body) text-[2.25rem] leading-tight text-black md:text-[3.15rem] lg:text-[3.6rem]">
              {service.title}
            </h1>
            <p className="mt-2 font-(family-name:--font-heading) text-[1.8rem] leading-none text-black/55 md:text-[2.4rem] lg:text-[2.7rem]">
              {service.eyebrow}
            </p> */}
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

    </main>
  );
}
