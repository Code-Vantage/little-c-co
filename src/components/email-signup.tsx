"use client";

import { FormEvent, useState } from "react";
import Reveal from "@/components/reveal";

export default function EmailSignup() {
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      return;
    }

    const subject = encodeURIComponent("Mailing List Signup");
    const body = encodeURIComponent(`Please add this email to the mailing list:\n\n${trimmedEmail}`);

    window.location.href = `mailto:littleccoartmakes@gmail.com?subject=${subject}&body=${body}`;
  }

  return (
    <Reveal as="section" aria-label="Email signup" className="px-6 py-14 md:px-16 md:py-18" delay={120}>
      <div className="lift-card mx-auto max-w-4xl border border-black/10 bg-white/45 px-6 py-10 text-center shadow-[0px_14px_34px_rgba(15,23,42,0.06)] sm:px-8 md:px-12">
        <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.32em] text-black/45">
          Stay Connected
        </p>
        <h2 className="mt-3 font-(family-name:--font-heading) text-4xl text-black md:text-5xl">
          Let&apos;s Collaborate
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-(family-name:--font-body) text-[1rem] leading-7 text-black/72 md:text-[1.08rem]">
          Occasional updates on new collections, live events, and thoughtful details.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-7 flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="h-12 flex-1 border border-black/15 bg-white px-4 font-(family-name:--font-body) text-base text-black outline-none placeholder:text-black/40 focus:border-black/35"
          />
          <button
            type="submit"
            className="button-soft inline-flex h-12 items-center justify-center bg-black px-6 font-(family-name:--font-body) text-sm uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#1a1a1a]"
          >
            Submit
          </button>
        </form>
      </div>
    </Reveal>
  );
}
