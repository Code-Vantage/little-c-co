"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Reveal from "@/components/reveal";

type AccountAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
};

type AccountProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  billing?: Partial<AccountAddress>;
  shipping?: Partial<AccountAddress>;
};

type AccountOrder = {
  id: number;
  status: string;
  date_created: string;
  total: string;
};

type AuthState = "checking" | "signedOut" | "signedIn";
type AccountSection =
  | "profile"
  | "orders"
  | "addresses"
  | "password"
  | "delete";
type BannerState = {
  type: "error" | "success";
  text: string;
};

const sectionLabels: Record<AccountSection, string> = {
  profile: "Profile",
  orders: "Orders",
  addresses: "Addresses",
  password: "Password",
  delete: "Delete Account",
};

const accountSections: AccountSection[] = [
  "orders",
  "profile",
  "addresses",
  "password",
  "delete",
];

function getSafeRedirectPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

function emptyAddress(): AccountAddress {
  return {
    first_name: "",
    last_name: "",
    company: "",
    address_1: "",
    address_2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
    email: "",
    phone: "",
  };
}

function normalizeAddress(address?: Partial<AccountAddress>): AccountAddress {
  return {
    first_name: address?.first_name ?? "",
    last_name: address?.last_name ?? "",
    company: address?.company ?? "",
    address_1: address?.address_1 ?? "",
    address_2: address?.address_2 ?? "",
    city: address?.city ?? "",
    state: address?.state ?? "",
    postcode: address?.postcode ?? "",
    country: address?.country ?? "",
    email: address?.email ?? "",
    phone: address?.phone ?? "",
  };
}

function createProfileDraft(profile?: AccountProfile | null) {
  return {
    first_name: profile?.first_name ?? "",
    last_name: profile?.last_name ?? "",
    email: profile?.email ?? "",
  };
}

function getInitials(profile: AccountProfile | null) {
  const first = profile?.first_name?.charAt(0) ?? "";
  const last = profile?.last_name?.charAt(0) ?? "";
  return `${first}${last}`.trim() || "LC";
}

function formatCurrency(amount: string | number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatOrderDate(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadgeClasses(status: string) {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "processing":
      return "border-sky-200 bg-sky-50 text-sky-700";
    case "on-hold":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pending":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "cancelled":
    case "failed":
      return "border-rose-200 bg-rose-50 text-rose-700";
    case "refunded":
      return "border-slate-200 bg-slate-100 text-slate-700";
    default:
      return "border-black/10 bg-black/5 text-black/70";
  }
}

function getPaymentStatus(status: string) {
  if (status === "processing" || status === "completed") return "Paid";
  if (status === "refunded") return "Refunded";
  if (status === "cancelled" || status === "failed") return "Cancelled";
  if (status === "on-hold") return "On hold";
  return "Pending";
}

function getFulfillmentStatus(status: string) {
  if (status === "completed") return "Fulfilled";
  if (status === "processing") return "In progress";
  if (status === "cancelled" || status === "failed") return "Stopped";
  if (status === "refunded") return "Returned";
  return "Awaiting fulfillment";
}

function formatAddressSummary(address: Partial<AccountAddress> | undefined, fallback: string) {
  if (!address?.address_1) return fallback;

  return [
    [address.first_name, address.last_name].filter(Boolean).join(" ").trim(),
    address.company,
    address.address_1,
    address.address_2,
    [address.city, address.state].filter(Boolean).join(", "),
    [address.postcode, address.country].filter(Boolean).join(" "),
  ]
    .filter((value) => Boolean(value?.trim()))
    .join(", ");
}

function AccountField({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-(family-name:--font-body) text-sm uppercase tracking-[0.16em] text-black/48">
        {label}
      </span>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="input h-12 rounded-none border-black/12 bg-transparent px-4"
      />
    </label>
  );
}

function SectionCard({
  title,
  description,
  children,
  tone = "default",
  delay = 0,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "danger";
  delay?: number;
}) {
  const toneClasses =
    tone === "danger"
      ? "border-rose-200 bg-[#fffaf8]"
      : "border-black/10 bg-transparent";

  return (
    <Reveal as="section" className={`border p-6 sm:p-8 ${toneClasses}`} delay={delay}>
      <div className="border-b border-black/10 pb-5">
        <h2 className="font-(family-name:--font-body) text-[1.75rem] leading-tight text-black sm:text-[2rem]">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-3xl font-(family-name:--font-body) text-sm leading-7 text-black/65 sm:text-base">
            {description}
          </p>
        )}
      </div>
      <div className="pt-6">{children}</div>
    </Reveal>
  );
}

export default function AccountPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authStep, setAuthStep] = useState<"email" | "login" | "register">("email");
  const [activeSection, setActiveSection] = useState<AccountSection>("orders");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddresses, setSavingAddresses] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [profileDraft, setProfileDraft] = useState(createProfileDraft(null));
  const [billingDraft, setBillingDraft] = useState<AccountAddress>(emptyAddress());
  const [shippingDraft, setShippingDraft] = useState<AccountAddress>(emptyAddress());
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [banner, setBanner] = useState<BannerState | null>(null);

  function syncAccountState(nextProfile: AccountProfile, nextOrders: AccountOrder[]) {
    setProfile(nextProfile);
    setOrders(nextOrders);
    setProfileDraft(createProfileDraft(nextProfile));
    setBillingDraft(normalizeAddress(nextProfile.billing));
    setShippingDraft(normalizeAddress(nextProfile.shipping));
  }

  function clearSignedInState() {
    setProfile(null);
    setOrders([]);
    setProfileDraft(createProfileDraft(null));
    setBillingDraft(emptyAddress());
    setShippingDraft(emptyAddress());
    setPasswordForm({
      current_password: "",
      new_password: "",
      confirm_password: "",
    });
    setDeletePassword("");
    setDeleteConfirmation("");
  }

  async function loadAccountData() {
    setLoading(true);

    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/account/profile"),
        fetch("/api/account/orders"),
      ]);

      if (profileRes.status === 401 || ordersRes.status === 401) {
        setAuthState("signedOut");
        clearSignedInState();
        return;
      }

      const profileData = (await profileRes.json()) as AccountProfile | { error?: string };
      const ordersData = (await ordersRes.json()) as AccountOrder[] | { error?: string };

      if (!profileRes.ok) {
        throw new Error(
          "error" in profileData ? profileData.error || "Failed to load profile" : "Failed to load profile",
        );
      }

      if (!ordersRes.ok) {
        throw new Error(
          "error" in ordersData ? ordersData.error || "Failed to load orders" : "Failed to load orders",
        );
      }

      syncAccountState(profileData as AccountProfile, Array.isArray(ordersData) ? ordersData : []);
      setAuthState("signedIn");
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to load account data",
      });
      setAuthState("signedOut");
      clearSignedInState();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccountData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();

    if (!email) {
      setBanner({ type: "error", text: "Please enter your email address." });
      return;
    }

    setCheckingEmail(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { exists?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to check your account.");
      }

      setAuthStep(data.exists ? "login" : "register");
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to check your account.",
      });
    } finally {
      setCheckingEmail(false);
    }
  }

  async function loginWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();

    if (!email || !passwordInput) {
      setBanner({ type: "error", text: "Please enter both email and password." });
      return;
    }

    setLoggingIn(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: passwordInput }),
      });
      const data = (await response.json()) as { first_name?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in.");
      }

      setPasswordInput("");
      await loadAccountData();
      setBanner({
        type: "success",
        text: `Welcome${data.first_name ? `, ${data.first_name}` : ""}. Your account is ready.`,
      });
      setActiveSection("orders");

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to sign in.",
      });
      setAuthState("signedOut");
    } finally {
      setLoggingIn(false);
    }
  }

  async function registerWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();

    if (!email || !passwordInput) {
      setBanner({ type: "error", text: "Please enter both email and password." });
      return;
    }

    if (passwordInput.length < 8) {
      setBanner({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }

    setLoggingIn(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: passwordInput,
          first_name: firstNameInput,
          last_name: lastNameInput,
        }),
      });
      const data = (await response.json()) as { first_name?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Unable to create your account.");
      }

      setPasswordInput("");
      setFirstNameInput("");
      setLastNameInput("");
      await loadAccountData();
      setBanner({
        type: "success",
        text: `Welcome${data.first_name ? `, ${data.first_name}` : ""}. Your account has been created.`,
      });
      setActiveSection("orders");

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to create your account.",
      });
      setAuthState("signedOut");
    } finally {
      setLoggingIn(false);
    }
  }

  async function requestPasswordReset() {
    const email = emailInput.trim().toLowerCase();

    if (!email) {
      setBanner({
        type: "error",
        text: "Enter your email first, then use the reset password action.",
      });
      return;
    }

    setRequestingReset(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Unable to request password reset.");
      }

      setBanner({
        type: "success",
        text:
          result.message ||
          "If an account exists for this email, password reset instructions have been sent.",
      });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to request password reset.",
      });
    } finally {
      setRequestingReset(false);
    }
  }

  async function logout() {
    setBanner(null);
    await fetch("/api/account/logout", { method: "POST" });
    setAuthState("signedOut");
    setAuthStep("email");
    setActiveSection("orders");
    clearSignedInState();
    setBanner({ type: "success", text: "You have been logged out." });
  }

  async function savePersonalInformation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    const email = profileDraft.email.trim().toLowerCase();
    if (!email) {
      setBanner({ type: "error", text: "Email is required." });
      return;
    }

    setSavingProfile(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: profileDraft.first_name,
          last_name: profileDraft.last_name,
          email,
        }),
      });
      const data = (await response.json()) as AccountProfile | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Failed to update your information." : "Failed to update your information.");
      }

      syncAccountState(data as AccountProfile, orders);
      setBanner({ type: "success", text: "Personal information updated successfully." });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update your information.",
      });
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveAddresses(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) return;

    setSavingAddresses(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing: {
            ...billingDraft,
            email: billingDraft.email || profileDraft.email,
          },
          shipping: shippingDraft,
        }),
      });
      const data = (await response.json()) as AccountProfile | { error?: string };

      if (!response.ok) {
        throw new Error("error" in data ? data.error || "Failed to save your addresses." : "Failed to save your addresses.");
      }

      syncAccountState(data as AccountProfile, orders);
      setBanner({ type: "success", text: "Addresses updated successfully." });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save your addresses.",
      });
    } finally {
      setSavingAddresses(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      setBanner({ type: "error", text: "Please complete all password fields." });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setBanner({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setBanner({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setChangingPassword(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to update your password.");
      }

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
      setBanner({ type: "success", text: data.message || "Password updated successfully." });
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update your password.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function deleteAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!deletePassword || !deleteConfirmation) {
      setBanner({
        type: "error",
        text: 'Enter your password and type "DELETE" to confirm account removal.',
      });
      return;
    }

    setDeletingAccount(true);
    setBanner(null);

    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: deletePassword,
          confirmation: deleteConfirmation,
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete your account.");
      }

      clearSignedInState();
      setAuthState("signedOut");
      setAuthStep("email");
      setActiveSection("orders");
      setEmailInput("");
      setPasswordInput("");
      setBanner({ type: "success", text: data.message || "Your account has been deleted." });
      router.refresh();
    } catch (error) {
      setBanner({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to delete your account.",
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  if (authState === "checking") {
    return <main className="min-h-screen" aria-hidden="true" />;
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <Reveal as="section" className="mb-8 border-b border-black/10 pb-8 sm:pb-10">
          <div className="max-w-3xl">
            <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.28em] text-black/45">
              Customer Account
            </p>
            <h1 className="mt-3 font-(family-name:--font-body) text-[2.5rem] leading-tight text-black sm:text-[3.2rem]">
              {authState === "signedIn" ? "Your Account" : "Manage Your Account"}
            </h1>
            <p className="mt-4 max-w-2xl font-(family-name:--font-body) text-base leading-7 text-black/65 sm:text-lg">
              Review orders, update saved details, and manage account settings.
            </p>
          </div>
        </Reveal>

        {banner && (
          <div
            className={`mb-6 border px-4 py-3 font-(family-name:--font-body) text-sm sm:text-base ${
              banner.type === "error"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700"
            }`}
          >
            {banner.text}
          </div>
        )}

        {authState === "signedOut" && (
          <div className="mx-auto max-w-xl">
            <SectionCard
              title={
                authStep === "login"
                  ? "Welcome back"
                  : authStep === "register"
                    ? "Create your account"
                    : "Start with your email"
              }
              description="Use the same email address you order with so your purchase history can be connected automatically."
              delay={60}
            >
              <div className="flex flex-col gap-4">
                {authStep === "email" && (
                  <form onSubmit={checkEmail} className="flex flex-col gap-4">
                    <AccountField
                      label="Email Address"
                      type="email"
                      autoComplete="email"
                      value={emailInput}
                      onChange={setEmailInput}
                      placeholder="Enter your email address"
                    />
                    <button
                      type="submit"
                      disabled={checkingEmail}
                      className={`h-12 border px-6 font-(family-name:--font-body) text-base text-white transition ${
                        checkingEmail ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                      }`}
                    >
                      {checkingEmail ? "Checking..." : "Continue"}
                    </button>
                  </form>
                )}

                {authStep === "login" && (
                  <form onSubmit={loginWithEmail} className="flex flex-col gap-4">
                    <div className="border border-black/10 px-4 py-3 font-(family-name:--font-body) text-sm text-black/65">
                      Signing in as <strong className="text-black">{emailInput}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep("email");
                          setPasswordInput("");
                          setBanner(null);
                        }}
                        className="ml-2 cursor-pointer underline underline-offset-4 hover:text-black"
                      >
                        change
                      </button>
                    </div>
                    <AccountField
                      label="Password"
                      type="password"
                      autoComplete="current-password"
                      value={passwordInput}
                      onChange={setPasswordInput}
                      placeholder="Enter your password"
                    />
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className={`h-12 border px-6 font-(family-name:--font-body) text-base text-white transition ${
                        loggingIn ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                      }`}
                    >
                      {loggingIn ? "Signing In..." : "Sign In"}
                    </button>
                    <button
                      type="button"
                      disabled={requestingReset}
                      onClick={() => void requestPasswordReset()}
                      className={`self-start font-(family-name:--font-body) text-sm underline underline-offset-4 ${
                        requestingReset ? "cursor-progress text-black/45" : "cursor-pointer text-black/70 hover:text-black"
                      }`}
                    >
                      {requestingReset ? "Sending reset..." : "Forgot password?"}
                    </button>
                  </form>
                )}

                {authStep === "register" && (
                  <form onSubmit={registerWithEmail} className="flex flex-col gap-4">
                    <div className="border border-black/10 px-4 py-3 font-(family-name:--font-body) text-sm text-black/65">
                      Creating an account for <strong className="text-black">{emailInput}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep("email");
                          setPasswordInput("");
                          setBanner(null);
                        }}
                        className="ml-2 cursor-pointer underline underline-offset-4 hover:text-black"
                      >
                        change
                      </button>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AccountField
                        label="First Name"
                        autoComplete="given-name"
                        value={firstNameInput}
                        onChange={setFirstNameInput}
                        placeholder="First name"
                      />
                      <AccountField
                        label="Last Name"
                        autoComplete="family-name"
                        value={lastNameInput}
                        onChange={setLastNameInput}
                        placeholder="Last name"
                      />
                    </div>
                    <AccountField
                      label="Create Password"
                      type="password"
                      autoComplete="new-password"
                      value={passwordInput}
                      onChange={setPasswordInput}
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className={`h-12 border px-6 font-(family-name:--font-body) text-base text-white transition ${
                        loggingIn ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                      }`}
                    >
                      {loggingIn ? "Creating Account..." : "Create Account"}
                    </button>
                    <p className="font-(family-name:--font-body) text-sm leading-6 text-black/55">
                      If you have previous guest orders with this email, we’ll try to connect them to your new account automatically.
                    </p>
                  </form>
                )}
              </div>
            </SectionCard>
          </div>
        )}

        {authState === "signedIn" && profile && (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <Reveal as="aside" className="border border-black/10 p-4 lg:sticky lg:top-28 lg:self-start">
              <div className="border border-black/10 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black font-(family-name:--font-body) text-[1.25rem] leading-none tracking-[0.05em] text-white">
                    {getInitials(profile)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-(family-name:--font-body) text-[1.75rem] leading-none text-black">
                      {profile.first_name || "Account"}
                    </p>
                    <p className="mt-1 truncate font-(family-name:--font-body) text-[0.95rem] text-black/60">
                      {profile.email}
                    </p>
                  </div>
                </div>
              </div>

              <nav
                aria-label="Account sections"
                className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
              >
                {accountSections.map((section) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setActiveSection(section)}
                    className={`button-soft min-w-max border px-4 py-3 text-left font-(family-name:--font-body) text-sm transition lg:w-full ${
                      activeSection === section
                        ? "border-black bg-black text-white"
                        : "border-black/10 text-black/70 hover:border-black/20 hover:text-black"
                    }`}
                  >
                    {sectionLabels[section]}
                  </button>
                ))}
              </nav>
              <button
                type="button"
                onClick={logout}
                className="mt-6 cursor-pointer font-(family-name:--font-body) text-sm text-black underline underline-offset-4 hover:text-black/70"
              >
                Log out
              </button>
            </Reveal>

            <div className="min-w-0 space-y-6">
              {activeSection === "profile" && (
                <SectionCard
                  title="Profile"
                  description="Update the name and email address connected to your account."
                  delay={80}
                >
                  <form onSubmit={savePersonalInformation} className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AccountField
                        label="First Name"
                        autoComplete="given-name"
                        value={profileDraft.first_name}
                        onChange={(value) => setProfileDraft((current) => ({ ...current, first_name: value }))}
                      />
                      <AccountField
                        label="Last Name"
                        autoComplete="family-name"
                        value={profileDraft.last_name}
                        onChange={(value) => setProfileDraft((current) => ({ ...current, last_name: value }))}
                      />
                    </div>
                    <div className="max-w-xl">
                      <AccountField
                        label="Email Address"
                        type="email"
                        autoComplete="email"
                        value={profileDraft.email}
                        onChange={(value) => setProfileDraft((current) => ({ ...current, email: value }))}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className={`button-soft border px-6 py-3 font-(family-name:--font-body) text-sm text-white transition ${
                          savingProfile ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                        }`}
                      >
                        {savingProfile ? "Saving..." : "Save Changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setProfileDraft(createProfileDraft(profile))}
                        className="button-soft border border-black/10 px-6 py-3 font-(family-name:--font-body) text-sm text-black hover:bg-black/3"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {activeSection === "orders" && (
                <SectionCard
                  title="Orders"
                  description="View the orders connected to this account."
                  delay={80}
                >
                  {loading ? (
                    <p className="font-(family-name:--font-body) text-base text-black/60">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <div className="border border-black/10 p-6">
                      <p className="font-(family-name:--font-body) text-base text-black/65">
                        No orders have been linked to this account yet.
                      </p>
                      <Link href="/shop" className="button-soft mt-4 inline-flex border border-black bg-black px-5 py-3 font-(family-name:--font-body) text-sm text-white hover:bg-black/85">
                        Browse products
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="hidden overflow-hidden border border-black/10 lg:block">
                        <table className="w-full border-collapse text-left font-(family-name:--font-body)">
                          <thead className="bg-black/[0.03] text-sm text-black/65">
                            <tr>
                              <th className="px-5 py-4 font-semibold">Order</th>
                              <th className="px-5 py-4 font-semibold">Date</th>
                              <th className="px-5 py-4 font-semibold">Status</th>
                              <th className="px-5 py-4 font-semibold">Payment</th>
                              <th className="px-5 py-4 font-semibold">Fulfillment</th>
                              <th className="px-5 py-4 text-right font-semibold">Total</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {orders.map((order) => (
                              <tr key={order.id} className="border-t border-black/6">
                                <td className="px-5 py-4 font-medium text-black">#{order.id}</td>
                                <td className="px-5 py-4 text-black/65">{formatOrderDate(order.date_created)}</td>
                                <td className="px-5 py-4">
                                  <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.14em] ${getStatusBadgeClasses(order.status)}`}>
                                    {order.status.replace("-", " ")}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-black/65">{getPaymentStatus(order.status)}</td>
                                <td className="px-5 py-4 text-black/65">{getFulfillmentStatus(order.status)}</td>
                                <td className="px-5 py-4 text-right font-medium text-black">{formatCurrency(order.total)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid gap-4 lg:hidden">
                        {orders.map((order) => (
                          <article key={order.id} className="border border-black/10 p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-(family-name:--font-body) text-2xl text-black">#{order.id}</p>
                                <p className="mt-1 font-(family-name:--font-body) text-sm text-black/60">
                                  {formatOrderDate(order.date_created)}
                                </p>
                              </div>
                              <span className={`rounded-full border px-3 py-1 font-(family-name:--font-body) text-[11px] uppercase tracking-[0.14em] ${getStatusBadgeClasses(order.status)}`}>
                                {order.status.replace("-", " ")}
                              </span>
                            </div>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.16em] text-black/45">Payment</p>
                                <p className="mt-1 font-(family-name:--font-body) text-sm text-black/65">{getPaymentStatus(order.status)}</p>
                              </div>
                              <div>
                                <p className="font-(family-name:--font-body) text-xs uppercase tracking-[0.16em] text-black/45">Fulfillment</p>
                                <p className="mt-1 font-(family-name:--font-body) text-sm text-black/65">{getFulfillmentStatus(order.status)}</p>
                              </div>
                            </div>
                            <p className="mt-4 font-(family-name:--font-body) text-sm font-medium text-black">
                              {formatCurrency(order.total)}
                            </p>
                          </article>
                        ))}
                      </div>
                    </>
                  )}
                </SectionCard>
              )}

              {activeSection === "addresses" && (
                <SectionCard
                  title="Addresses"
                  description="Update your billing and shipping details."
                  delay={80}
                >
                  <form onSubmit={saveAddresses} className="space-y-8">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <div className="border border-black/10 p-5">
                        <h3 className="font-(family-name:--font-body) text-2xl text-black">Billing Address</h3>
                        <div className="mt-5 grid gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="First Name" value={billingDraft.first_name} onChange={(value) => setBillingDraft((current) => ({ ...current, first_name: value }))} />
                            <AccountField label="Last Name" value={billingDraft.last_name} onChange={(value) => setBillingDraft((current) => ({ ...current, last_name: value }))} />
                          </div>
                          <AccountField label="Company" value={billingDraft.company} onChange={(value) => setBillingDraft((current) => ({ ...current, company: value }))} />
                          <AccountField label="Address Line 1" value={billingDraft.address_1} onChange={(value) => setBillingDraft((current) => ({ ...current, address_1: value }))} />
                          <AccountField label="Address Line 2" value={billingDraft.address_2} onChange={(value) => setBillingDraft((current) => ({ ...current, address_2: value }))} />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="City" value={billingDraft.city} onChange={(value) => setBillingDraft((current) => ({ ...current, city: value }))} />
                            <AccountField label="State / Region" value={billingDraft.state} onChange={(value) => setBillingDraft((current) => ({ ...current, state: value }))} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="Postal Code" value={billingDraft.postcode} onChange={(value) => setBillingDraft((current) => ({ ...current, postcode: value }))} />
                            <AccountField label="Country" value={billingDraft.country} onChange={(value) => setBillingDraft((current) => ({ ...current, country: value }))} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="Billing Email" type="email" value={billingDraft.email} onChange={(value) => setBillingDraft((current) => ({ ...current, email: value }))} />
                            <AccountField label="Phone Number" value={billingDraft.phone} onChange={(value) => setBillingDraft((current) => ({ ...current, phone: value }))} />
                          </div>
                        </div>
                      </div>

                      <div className="border border-black/10 p-5">
                        <h3 className="font-(family-name:--font-body) text-2xl text-black">Shipping Address</h3>
                        <div className="mt-5 grid gap-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="First Name" value={shippingDraft.first_name} onChange={(value) => setShippingDraft((current) => ({ ...current, first_name: value }))} />
                            <AccountField label="Last Name" value={shippingDraft.last_name} onChange={(value) => setShippingDraft((current) => ({ ...current, last_name: value }))} />
                          </div>
                          <AccountField label="Company" value={shippingDraft.company} onChange={(value) => setShippingDraft((current) => ({ ...current, company: value }))} />
                          <AccountField label="Address Line 1" value={shippingDraft.address_1} onChange={(value) => setShippingDraft((current) => ({ ...current, address_1: value }))} />
                          <AccountField label="Address Line 2" value={shippingDraft.address_2} onChange={(value) => setShippingDraft((current) => ({ ...current, address_2: value }))} />
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="City" value={shippingDraft.city} onChange={(value) => setShippingDraft((current) => ({ ...current, city: value }))} />
                            <AccountField label="State / Region" value={shippingDraft.state} onChange={(value) => setShippingDraft((current) => ({ ...current, state: value }))} />
                          </div>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <AccountField label="Postal Code" value={shippingDraft.postcode} onChange={(value) => setShippingDraft((current) => ({ ...current, postcode: value }))} />
                            <AccountField label="Country" value={shippingDraft.country} onChange={(value) => setShippingDraft((current) => ({ ...current, country: value }))} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={savingAddresses}
                        className={`button-soft border px-6 py-3 font-(family-name:--font-body) text-sm text-white transition ${
                          savingAddresses ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                        }`}
                      >
                        {savingAddresses ? "Saving..." : "Save Addresses"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setBillingDraft(normalizeAddress(profile.billing));
                          setShippingDraft(normalizeAddress(profile.shipping));
                        }}
                        className="button-soft border border-black/10 px-6 py-3 font-(family-name:--font-body) text-sm text-black hover:bg-black/3"
                      >
                        Reset
                      </button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {activeSection === "password" && (
                <SectionCard
                  title="Password"
                  description="Update your password using your current one to confirm the change."
                  delay={80}
                >
                  <form onSubmit={updatePassword} className="max-w-2xl space-y-5">
                    <AccountField
                      label="Current Password"
                      type="password"
                      autoComplete="current-password"
                      value={passwordForm.current_password}
                      onChange={(value) => setPasswordForm((current) => ({ ...current, current_password: value }))}
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <AccountField
                        label="New Password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordForm.new_password}
                        onChange={(value) => setPasswordForm((current) => ({ ...current, new_password: value }))}
                      />
                      <AccountField
                        label="Confirm New Password"
                        type="password"
                        autoComplete="new-password"
                        value={passwordForm.confirm_password}
                        onChange={(value) => setPasswordForm((current) => ({ ...current, confirm_password: value }))}
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={changingPassword}
                        className={`button-soft border px-6 py-3 font-(family-name:--font-body) text-sm text-white transition ${
                          changingPassword ? "cursor-progress bg-black/60" : "cursor-pointer bg-black hover:bg-black/85"
                        }`}
                      >
                      {changingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </SectionCard>
              )}

              {activeSection === "delete" && (
                <SectionCard
                  title="Delete your account"
                  description="Deleting your account is permanent and should only be used when you are sure you no longer want access to this customer profile."
                  tone="danger"
                  delay={80}
                >
                  <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <form onSubmit={deleteAccount} className="space-y-5">
                      <AccountField label="Password" type="password" value={deletePassword} onChange={setDeletePassword} placeholder="Enter your current password" />
                      <AccountField label='Type "DELETE" to confirm' value={deleteConfirmation} onChange={setDeleteConfirmation} placeholder="DELETE" />
                      <button
                        type="submit"
                        disabled={deletingAccount}
                        className={`button-soft border px-6 py-3 font-(family-name:--font-body) text-sm text-white transition ${
                          deletingAccount ? "cursor-progress bg-rose-300" : "cursor-pointer bg-rose-600 hover:bg-rose-700"
                        }`}
                      >
                        {deletingAccount ? "Deleting..." : "Delete Account"}
                      </button>
                    </form>

                    <div className="border border-rose-200 p-5">
                      <ul className="space-y-3 font-(family-name:--font-body) text-sm leading-6 text-black/65">
                        <li>Your account session will be removed immediately.</li>
                        <li>Stored account details will no longer be accessible from this profile.</li>
                        <li>Only proceed if you are certain this action is necessary.</li>
                      </ul>
                    </div>
                  </div>
                </SectionCard>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
