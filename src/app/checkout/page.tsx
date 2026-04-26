"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CheckoutPayload } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";

type BillingForm = CheckoutPayload["billing"];
type ShippingForm = CheckoutPayload["shipping"];

type AccountProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
};

const initialBilling: BillingForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address_1: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
};

const initialShipping: ShippingForm = {
  first_name: "",
  last_name: "",
  address_1: "",
  city: "",
  state: "",
  postcode: "",
  country: "IN",
};

function formatPrice(value: number) {
  return `₹${Math.max(0, value).toLocaleString("en-IN")}`;
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const [billing, setBilling] = useState<BillingForm>(initialBilling);
  const [shipping, setShipping] = useState<ShippingForm>(initialShipping);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Post-purchase register state
  const [postPurchasePassword, setPostPurchasePassword] = useState("");
  const [postPurchaseStatus, setPostPurchaseStatus] = useState<"idle" | "submitting" | "success" | "email-in-use">("idle");
  const [postPurchaseError, setPostPurchaseError] = useState<string | null>(null);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  useEffect(() => {
    async function loadExistingSession() {
      try {
        const res = await fetch("/api/account/profile");
        if (!res.ok) return;

        const profile = (await res.json()) as AccountProfile;

        setIsLoggedIn(true);
        setBilling((prev) => ({
          ...prev,
          first_name: profile.first_name || prev.first_name,
          last_name: profile.last_name || prev.last_name,
          email: profile.email || prev.email,
        }));
      } catch {
        // Keep guest flow available.
      }
    }

    void loadExistingSession();
  }, []);

  async function handleCheckoutLogin() {

    const email = loginEmail.trim().toLowerCase();
    if (!email || !loginPassword) {
      setError("Enter both email and password to sign in.");
      return;
    }

    setLoggingIn(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/account/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: loginPassword,
        }),
      });

      const result = (await response.json()) as {
        first_name?: string;
        last_name?: string;
        email?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Unable to sign in");
      }

      setIsLoggedIn(true);
      setLoginPassword("");
      setBilling((prev) => ({
        ...prev,
        first_name: result.first_name || prev.first_name,
        last_name: result.last_name || prev.last_name,
        email: result.email || email,
      }));
      setNotice("Signed in successfully. Your checkout is now linked to your account.");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleForgotPassword() {
    const email = loginEmail.trim().toLowerCase();
    if (!email) {
      setError("Enter your email first, then click Forgot Password.");
      return;
    }

    setRequestingReset(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Unable to request password reset");
      }

      setNotice(
        result.message ||
          "If an account exists for this email, password reset instructions have been sent.",
      );
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Unable to request password reset");
    } finally {
      setRequestingReset(false);
    }
  }

  async function handlePostPurchaseRegister(e: React.FormEvent) {
    e.preventDefault();
    if (postPurchasePassword.length < 8) {
      setPostPurchaseError("Password must be at least 8 characters.");
      return;
    }

    setPostPurchaseStatus("submitting");
    setPostPurchaseError(null);

    try {
      const response = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: billing.email,
          password: postPurchasePassword,
          first_name: billing.first_name,
          last_name: billing.last_name,
        }),
      });

      const data = await response.json() as { error?: string };

      if (!response.ok) {
        if (data.error && (data.error.toLowerCase().includes("already registered") || data.error.toLowerCase().includes("already exists"))) {
          setPostPurchaseStatus("email-in-use");
          return;
        }
        throw new Error(data.error || "Failed to create account.");
      }

      setPostPurchaseStatus("success");
    } catch (err) {
      setPostPurchaseError(err instanceof Error ? err.message : "Failed to create account");
      setPostPurchaseStatus("idle");
    }
  }

  async function handleCheckoutLogout() {
    setError(null);
    setNotice(null);

    await fetch("/api/account/logout", { method: "POST" });
    setIsLoggedIn(false);
    setLoginPassword("");
    setNotice("Logged out. You can continue as guest or sign in again.");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setNotice(null);

    const shippingPayload: ShippingForm = sameAsBilling
      ? {
          first_name: billing.first_name,
          last_name: billing.last_name,
          address_1: billing.address_1,
          city: billing.city,
          state: billing.state,
          postcode: billing.postcode,
          country: billing.country,
        }
      : shipping;

    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billing,
          shipping: shippingPayload,
          line_items: items.map((item) => ({
            product_id: item.id,
            quantity: item.quantity,
          })),
        } satisfies CheckoutPayload),
      });

      const result = (await response.json()) as { id?: number; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order");
      }

      setOrderId(result.id ?? null);
      clearCart();
      setNotice("Order placed successfully.");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  if (orderId) {
    return (
      <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="relative p-8">
            <div className="relative z-10">
              <h1 className="font-(family-name:--font-body) text-3xl md:text-4xl text-black mb-3">Order Placed</h1>
              <p className="font-(family-name:--font-body) text-lg text-black mb-6">
                Thank you. Your order <strong>#{orderId}</strong> has been created successfully.
                <br />
                We&apos;ve sent a confirmation email to <strong>{billing.email}</strong>.
              </p>

              {!isLoggedIn && postPurchaseStatus !== "success" && postPurchaseStatus !== "email-in-use" && (
                <div className="mt-8 mb-8 rounded-2xl border border-black/10 bg-white/45 p-6">
                  <h3 className="font-(family-name:--font-body) text-2xl text-black mb-2">Save your information</h3>
                  <p className="font-(family-name:--font-body) text-base text-black/80 mb-4">
                    Set a password to create an account for a faster checkout next time. You can also track your new order!
                  </p>
                  
                  {postPurchaseError && (
                    <p className="font-(family-name:--font-body) text-sm text-[#b91c1c] mb-3">{postPurchaseError}</p>
                  )}

                  <form onSubmit={handlePostPurchaseRegister} className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      minLength={8}
                      className="input h-12 flex-1 max-w-sm"
                      value={postPurchasePassword}
                      onChange={(e) => setPostPurchasePassword(e.target.value)}
                    />
                    <button
                      type="submit"
                      disabled={postPurchaseStatus === "submitting"}
                      className={`h-12 px-6 text-white font-(family-name:--font-body) font-semibold text-base transition-colors ${
                        postPurchaseStatus === "submitting"
                          ? "bg-black/70 cursor-progress"
                          : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {postPurchaseStatus === "submitting" ? "Creating..." : "Create Account"}
                    </button>
                  </form>
                </div>
              )}

              {postPurchaseStatus === "success" && (
                <div className="mt-8 mb-8 rounded-2xl bg-[#e8f5e9] p-5 text-[#1f6f2a] font-(family-name:--font-body)">
                  <strong>Success!</strong> Your account has been created and your order is linked.
                </div>
              )}

              {postPurchaseStatus === "email-in-use" && (
                <div className="mt-8 mb-8 rounded-2xl border border-black/10 bg-white/45 p-5 font-(family-name:--font-body)">
                  It looks like you already have an account!{" "}
                  <a href="/account" className="underline text-black hover:opacity-70">Log in here</a> to track your order.
                </div>
              )}

              <a
                href="/shop"
                className="inline-flex items-center justify-center bg-transparent border-2 border-black text-black font-(family-name:--font-body) text-lg px-6 h-12 hover:bg-black hover:text-white transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8 sm:py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-7xl">
        <h1 className="font-(family-name:--font-body) text-4xl md:text-5xl text-black mb-6 md:mb-10">Checkout</h1>

        {items.length === 0 ? (
          <div className="relative p-8">
            <div className="relative z-10">
              <p className="font-(family-name:--font-body) text-xl text-black mb-4">
                Your cart is empty.
              </p>
              <a
                href="/shop"
                className="inline-flex items-center justify-center bg-black text-white font-(family-name:--font-body) text-lg px-6 h-12"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="relative p-6">
                <div className="relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="font-(family-name:--font-body) text-3xl text-black">Contact</h2>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={handleCheckoutLogout}
                        className="border border-black px-4 h-10 font-(family-name:--font-body) text-sm text-black cursor-pointer hover:bg-black hover:text-white transition-colors"
                      >
                        Logout
                      </button>
                    )}
                  </div>

                  {isLoggedIn ? (
                    <div className="inline-flex items-center rounded-full bg-[#e8f5e9] px-4 py-2 font-(family-name:--font-body) text-sm text-[#1f6f2a]">
                      Logged in as {billing.email}. This order will be linked to your account.
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-black/10 bg-white/45 p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 flex-wrap">
                          <p className="font-(family-name:--font-body) text-base text-black/80">
                            Email
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowLogin(!showLogin)}
                            className="font-(family-name:--font-body) text-sm underline text-black hover:opacity-70 cursor-pointer"
                          >
                            Already have an account? Log in
                          </button>
                        </div>
                        <input
                          type="email"
                          required
                          placeholder="Email address for order updates"
                          className="input h-12 mt-3"
                          autoComplete="email"
                          value={billing.email}
                          onChange={(event) =>
                            setBilling((prev) => ({ ...prev, email: event.target.value }))
                          }
                        />

                        {showLogin && (
                          <div className="mt-4 pt-4 border-t border-black/10">
                            <p className="mb-3 font-(family-name:--font-body) text-sm text-black/70">
                              Please enter your password to log in.
                            </p>
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                              <input
                                type="password"
                                placeholder="Password"
                                className="input h-12"
                                autoComplete="current-password"
                                value={loginPassword}
                                onChange={(event) => setLoginPassword(event.target.value)}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setLoginEmail(billing.email);
                                  void handleCheckoutLogin();
                                }}
                                disabled={loggingIn}
                                className={`h-12 px-6 text-white font-(family-name:--font-body) font-semibold text-base transition-colors ${
                                  loggingIn
                                    ? "bg-black/70 cursor-progress"
                                    : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
                                }`}
                              >
                                {loggingIn ? "Logging in..." : "Log In"}
                              </button>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setLoginEmail(billing.email);
                                  void handleForgotPassword();
                                }}
                                disabled={requestingReset}
                                className={`font-(family-name:--font-body) text-sm underline underline-offset-2 transition-opacity ${
                                  requestingReset
                                    ? "text-black/50 cursor-progress"
                                    : "text-black cursor-pointer hover:opacity-70"
                                }`}
                              >
                                {requestingReset ? "Sending reset..." : "Forgot password?"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </section>

              <section className="relative p-6">
                <div className="relative z-10">
                  <h2 className="font-(family-name:--font-body) text-3xl text-black mb-5">Billing Details</h2>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <input
                      required
                      placeholder="First Name"
                      className="input"
                      value={billing.first_name}
                      onChange={(e) => setBilling((prev) => ({ ...prev, first_name: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Last Name"
                      className="input"
                      value={billing.last_name}
                      onChange={(e) => setBilling((prev) => ({ ...prev, last_name: e.target.value }))}
                    />
                    <input
                      required
                      type="email"
                      placeholder="Email"
                      className="input sm:col-span-2"
                      value={billing.email}
                      onChange={(e) => setBilling((prev) => ({ ...prev, email: e.target.value }))}
                    />
                    <input
                      placeholder="Phone"
                      className="input sm:col-span-2"
                      value={billing.phone || ""}
                      onChange={(e) => setBilling((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Address"
                      className="input sm:col-span-2"
                      value={billing.address_1}
                      onChange={(e) => setBilling((prev) => ({ ...prev, address_1: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="City"
                      className="input"
                      value={billing.city}
                      onChange={(e) => setBilling((prev) => ({ ...prev, city: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="State"
                      className="input"
                      value={billing.state}
                      onChange={(e) => setBilling((prev) => ({ ...prev, state: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Postcode"
                      className="input"
                      value={billing.postcode}
                      onChange={(e) => setBilling((prev) => ({ ...prev, postcode: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Country"
                      className="input"
                      value={billing.country}
                      onChange={(e) => setBilling((prev) => ({ ...prev, country: e.target.value }))}
                    />
                  </div>
                </div>
              </section>

              <section className="relative p-6">
                <div className="relative z-10">
                  <label className="inline-flex items-center gap-2 font-(family-name:--font-body) text-black mb-4">
                    <input
                      type="checkbox"
                      checked={sameAsBilling}
                      onChange={(e) => setSameAsBilling(e.target.checked)}
                    />
                    Shipping address same as billing
                  </label>

                  {!sameAsBilling && (
                    <>
                      <h2 className="font-(family-name:--font-body) text-3xl text-black mb-5">Shipping Details</h2>
                      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                        <input
                          required
                          placeholder="First Name"
                          className="input"
                          value={shipping.first_name}
                          onChange={(e) => setShipping((prev) => ({ ...prev, first_name: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="Last Name"
                          className="input"
                          value={shipping.last_name}
                          onChange={(e) => setShipping((prev) => ({ ...prev, last_name: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="Address"
                          className="input sm:col-span-2"
                          value={shipping.address_1}
                          onChange={(e) => setShipping((prev) => ({ ...prev, address_1: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="City"
                          className="input"
                          value={shipping.city}
                          onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="State"
                          className="input"
                          value={shipping.state}
                          onChange={(e) => setShipping((prev) => ({ ...prev, state: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="Postcode"
                          className="input"
                          value={shipping.postcode}
                          onChange={(e) => setShipping((prev) => ({ ...prev, postcode: e.target.value }))}
                        />
                        <input
                          required
                          placeholder="Country"
                          className="input"
                          value={shipping.country}
                          onChange={(e) => setShipping((prev) => ({ ...prev, country: e.target.value }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </section>

              {error && (
                <p className="font-(family-name:--font-body) text-base text-[#b91c1c]">{error}</p>
              )}
              {notice && (
                <p className="font-(family-name:--font-body) text-base text-[#1f6f2a]">{notice}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className={`w-full h-14 text-white font-(family-name:--font-body) text-xl transition-colors ${
                  submitting
                    ? "bg-black/70 cursor-progress"
                    : "bg-black hover:bg-[#1a1a1a] cursor-pointer"
                }`}
              >
                {submitting ? "Placing Order..." : "Place Order"}
              </button>
            </form>

            <aside className="relative p-6 h-fit">
              <div className="relative z-10">
                <h2 className="font-(family-name:--font-body) text-3xl text-black mb-5">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-3">
                      <div className="font-(family-name:--font-body) text-base text-black min-w-0">
                        <p className="break-words">{item.name}</p>
                        <p className="text-black/70">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-(family-name:--font-body) text-base text-black shrink-0">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-black/20 pt-4 flex items-center justify-between">
                  <span className="font-(family-name:--font-body) text-lg text-black">Subtotal</span>
                  <span className="font-(family-name:--font-body) text-lg text-black">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
