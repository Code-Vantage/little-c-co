import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <main className="min-h-screen px-4 py-12 sm:px-8 sm:py-16 md:px-16 md:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[#1f3b2d] bg-[#1f3b2d]">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M20 6L9 17l-5-5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <p className="mt-6 font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
          Order Confirmed
        </p>
        <h1 className="mt-3 font-(family-name:--font-body) text-[2.2rem] leading-tight text-black sm:text-[2.7rem]">
          Thank you for your <span className="font-(family-name:--font-heading)">order</span>
        </h1>

        {order && (
          <p className="mt-4 font-(family-name:--font-body) text-base text-black/65">
            Your order number is <span className="font-medium text-black">#{order}</span>. A
            confirmation email is on its way to you.
          </p>
        )}

        <div className="mx-auto mt-10 max-w-md border border-black/10 bg-white/40 p-6 text-left">
          <p className="font-(family-name:--font-body) text-[0.72rem] uppercase tracking-[0.24em] text-black/45">
            What happens next
          </p>
          <ul className="mt-4 space-y-3 font-(family-name:--font-body) text-sm leading-6 text-black/75">
            <li className="flex gap-3">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
              We&apos;ll review your personalisation details and begin crafting your piece.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
              You&apos;ll receive updates by email as your order progresses.
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-black/40" />
              Timelines vary based on customization — we&apos;ll confirm an estimate shortly.
            </li>
          </ul>
        </div>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/account"
            className="button-soft inline-flex h-12 w-full items-center justify-center border border-black bg-black px-8 font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-white transition-colors hover:bg-black/85 sm:w-auto"
          >
            View Order
          </Link>
          <Link
            href="/shop"
            className="button-soft inline-flex h-12 w-full items-center justify-center border border-black/15 px-8 font-(family-name:--font-body) text-sm text-black transition-colors hover:bg-black/3 sm:w-auto"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
