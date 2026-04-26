"use client";

import { Suspense } from "react";
import AccountPageClient from "@/app/account/account-page-client";

export default function AccountPage() {
  return (
    <Suspense fallback={<p className="px-6 py-10">Loading...</p>}>
      <AccountPageClient />
    </Suspense>
  );
}
