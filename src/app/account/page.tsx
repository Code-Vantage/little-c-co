"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type AccountProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
};

type AccountOrder = {
  id: number;
  status: string;
  date_created: string;
  total: string;
};

type AuthState = "checking" | "signedOut" | "signedIn";

function getSafeRedirectPath(value: string | null) {
  if (!value) return null;
  if (!value.startsWith("/")) return null;
  if (value.startsWith("//")) return null;
  return value;
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get("redirect"));

  const [authState, setAuthState] = useState<AuthState>("checking");
  const [authStep, setAuthStep] = useState<"email" | "login" | "register">("email");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [firstNameInput, setFirstNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [requestingReset, setRequestingReset] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadAccountData() {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, ordersRes] = await Promise.all([
        fetch("/api/account/profile"),
        fetch("/api/account/orders"),
      ]);

      if (profileRes.status === 401 || ordersRes.status === 401) {
        setAuthState("signedOut");
        setProfile(null);
        setOrders([]);
        return;
      }

      const profileData = (await profileRes.json()) as AccountProfile | { error?: string };
      const ordersData = (await ordersRes.json()) as AccountOrder[] | { error?: string };

      if (!profileRes.ok) {
        throw new Error("error" in profileData ? profileData.error || "Failed to load profile" : "Failed to load profile");
      }
      if (!ordersRes.ok) {
        throw new Error("error" in ordersData ? ordersData.error || "Failed to load orders" : "Failed to load orders");
      }

      setProfile(profileData as AccountProfile);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setAuthState("signedIn");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load account data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAccountData();
  }, []);

  async function loginWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const email = emailInput.trim().toLowerCase();
    if (!email || !passwordInput) {
      setError("Please enter email and password.");
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
          password: passwordInput,
        }),
      });

      const data = (await response.json()) as { first_name?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Unable to sign in");
      }

      setNotice(
        `Welcome${data.first_name ? `, ${data.first_name}` : ""}. Your account is connected.`,
      );
      setEmailInput("");
      setPasswordInput("");
      await loadAccountData();

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Unable to sign in");
      setAuthState("signedOut");
    } finally {
      setLoggingIn(false);
    }
  }

  async function checkEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError("Please enter your email.");
      return;
    }

    setCheckingEmail(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch("/api/account/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (data.exists) {
        setAuthStep("login");
      } else {
        setAuthStep("register");
      }
    } catch {
      setError("Failed to check email. Try again.");
    } finally {
      setCheckingEmail(false);
    }
  }

  async function registerWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = emailInput.trim().toLowerCase();
    if (!email || !passwordInput) {
      setError("Please enter email and password.");
      return;
    }
    if (passwordInput.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoggingIn(true);
    setError(null);
    setNotice(null);

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

      const data = await response.json() as { first_name?: string; message?: string; error?: string };

      if (!response.ok) {
        if (data.error && (data.error.toLowerCase().includes("already registered") || data.error.toLowerCase().includes("already exists"))) {
           setError("Account already exists with this email. Please go back and sign in.");
           return;
        }
        throw new Error(data.error || "Invalid registration");
      }

      setNotice(`Welcome${data.first_name ? `, ${data.first_name}` : ""}. Your account has been created.`);
      setPasswordInput("");
      setFirstNameInput("");
      setLastNameInput("");
      await loadAccountData();

      if (redirectPath) {
        router.push(redirectPath);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign up");
      setAuthState("signedOut");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    setError(null);
    setNotice(null);

    await fetch("/api/account/logout", { method: "POST" });
    setAuthState("signedOut");
    setProfile(null);
    setOrders([]);
    setNotice("You have been logged out.");
  }

  async function requestPasswordReset() {
    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setError("Enter your email first, then click Forgot password.");
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

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name: profile.first_name,
          last_name: profile.last_name,
          email: profile.email,
        }),
      });

      const data = (await res.json()) as AccountProfile | { error?: string };
      if (!res.ok) {
        throw new Error("error" in data ? data.error || "Failed to save profile" : "Failed to save profile");
      }

      setProfile(data as AccountProfile);
      setNotice("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="bg-[#f5f0e8] min-h-screen px-8 py-12 md:px-16 md:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-center mb-12 mt-6">
          <h1 className="font-(family-name:--font-body) text-4xl text-black mb-4">
            {authState === "signedOut" ? (authStep === "login" ? "Login" : authStep === "register" ? "Create Account" : "Account") : "My Account"}
          </h1>
          {authState === "signedIn" && (
            <button
              type="button"
              onClick={logout}
              className="text-black/70 font-(family-name:--font-body) text-sm cursor-pointer hover:text-black flex items-center gap-1 transition-all underline underline-offset-4"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Log out
            </button>
          )}
        </div>

        {error && <p className="font-(family-name:--font-body) text-base text-[#b91c1c] mb-4 text-center">{error}</p>}
        {notice && <p className="font-(family-name:--font-body) text-base text-[#1f6f2a] mb-4 text-center">{notice}</p>}

        {authState === "checking" && (
          <section className="relative bg-[#fbf3e0] p-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
            <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none" />
            <div className="relative z-10">
              <p className="font-(family-name:--font-body) text-base text-black/70">Checking account session...</p>
            </div>
          </section>
        )}

        {authState === "signedOut" && (
            <section className="relative w-full max-w-lg mx-auto bg-[#fbf3e0] p-6 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] mb-8">
              <div className="absolute inset-1.5 border-3 border-dashed border-[#93a267] pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-4">


                {authStep === "email" && (
                  <form onSubmit={checkEmail} className="flex flex-col gap-3">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(event) => setEmailInput(event.target.value)}
                      placeholder="Enter your email"
                      className="input h-12"
                    />
                    <button
                      type="submit"
                      disabled={checkingEmail}
                      className={`text-white font-(family-name:--font-body) text-base h-12 px-6 transition-colors ${
                        checkingEmail ? "bg-black/70 cursor-progress" : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {checkingEmail ? "Checking..." : "Continue"}
                    </button>
                  </form>
                )}

                {authStep === "login" && (
                  <form onSubmit={loginWithEmail} className="flex flex-col gap-3">
                    <p className="font-(family-name:--font-body) text-sm text-black/70">
                      Logging in as <strong>{emailInput}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep("email");
                          setPasswordInput("");
                        }}
                        className="ml-2 underline hover:opacity-70 cursor-pointer"
                      >
                        (change)
                      </button>
                    </p>
                    <input
                      type="password"
                      required
                      value={passwordInput}
                      onChange={(event) => setPasswordInput(event.target.value)}
                      placeholder="Enter your password"
                      className="input h-12"
                    />
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className={`text-white font-(family-name:--font-body) text-base h-12 px-6 transition-colors ${
                        loggingIn ? "bg-black/70 cursor-progress" : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {loggingIn ? "Signing In..." : "Sign In"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void requestPasswordReset()}
                      disabled={requestingReset}
                      className={`self-start mt-1 font-(family-name:--font-body) text-sm underline transition-opacity ${
                        requestingReset ? "text-black/50 cursor-progress" : "text-black cursor-pointer hover:opacity-70"
                      }`}
                    >
                      {requestingReset ? "Sending reset..." : "Forgot password?"}
                    </button>
                  </form>
                )}

                {authStep === "register" && (
                  <form onSubmit={registerWithEmail} className="flex flex-col gap-3">
                    <p className="font-(family-name:--font-body) text-sm text-black/70">
                      Signing up as <strong>{emailInput}</strong>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthStep("email");
                          setPasswordInput("");
                        }}
                        className="ml-2 underline hover:opacity-70 cursor-pointer"
                      >
                        (change)
                      </button>
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={firstNameInput}
                        onChange={(event) => setFirstNameInput(event.target.value)}
                        placeholder="First Name (optional)"
                        className="input h-12"
                      />
                      <input
                        type="text"
                        value={lastNameInput}
                        onChange={(event) => setLastNameInput(event.target.value)}
                        placeholder="Last Name (optional)"
                        className="input h-12"
                      />
                    </div>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordInput}
                      onChange={(event) => setPasswordInput(event.target.value)}
                      placeholder="Create a password (min 8 chars)"
                      className="input h-12"
                    />
                    <button
                      type="submit"
                      disabled={loggingIn}
                      className={`text-white font-(family-name:--font-body) text-base h-12 px-6 transition-colors ${
                        loggingIn ? "bg-black/70 cursor-progress" : "bg-black cursor-pointer hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {loggingIn ? "Creating Account..." : "Sign Up"}
                    </button>
                    <p className="font-(family-name:--font-body) text-xs text-black/60 mt-1">
                      If you have previously placed orders as a guest with this email, your purchase history will automatically be linked!
                    </p>
                  </form>
                )}
              </div>
            </section>
          )}

          {authState === "signedIn" && (
            <div className="flex flex-col gap-10">

              <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                {/* Orders Section */}
                <section>
                  <h3 className="font-(family-name:--font-body) text-xl text-black mb-6">Order History</h3>
                  {loading ? (
                    <p className="font-(family-name:--font-body) text-base text-black/70">Loading orders...</p>
                  ) : orders.length === 0 ? (
                    <p className="font-(family-name:--font-body) text-base text-black/70">You haven't placed any orders yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-(family-name:--font-body) border-collapse">
                        <thead>
                          <tr className="border-b border-black/15 text-sm mb-4">
                            <th className="pb-4 font-normal text-black font-semibold">Order</th>
                            <th className="pb-4 font-normal text-black font-semibold">Date</th>
                            <th className="pb-4 font-normal text-black font-semibold">Payment Status</th>
                            <th className="pb-4 font-normal text-black font-semibold">Fulfillment Status</th>
                            <th className="pb-4 font-normal text-black font-semibold text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody className="text-sm">
                          {orders.map((order) => (
                            <tr key={order.id} className="border-b border-black/5">
                              <td className="py-4">
                                <span className="text-black cursor-pointer hover:underline">
                                  #{order.id}
                                </span>
                              </td>
                              <td className="py-4 text-black/80">
                                {new Date(order.date_created).toLocaleDateString("en-IN", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-4 text-black/80">
                                {order.status === "processing" || order.status === "completed" ? "Paid" : "Pending"}
                              </td>
                              <td className="py-4 text-black/80">
                                {order.status === "completed" ? "Fulfilled" : "Unfulfilled"}
                              </td>
                              <td className="py-4 text-black/80 text-right">
                                ₹{Number(order.total || 0).toLocaleString("en-IN")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {/* Account Details Section */}
                <aside className="border-t lg:border-t-0 lg:border-l border-black/10 pt-10 lg:pt-0 lg:pl-12">
                  <h3 className="font-(family-name:--font-body) text-xl text-black mb-6">Account Details</h3>
                  {loading || !profile ? (
                    <p className="font-(family-name:--font-body) text-base text-black/70">Loading profile...</p>
                  ) : (
                    <div className="font-(family-name:--font-body) text-base space-y-1">
                       <p className="text-black">{profile.first_name} {profile.last_name}</p>
                       <p className="text-black/80">{profile.email}</p>
                       
                       <div className="mt-8 mb-4">
                         {profile.billing?.address_1 ? (
                           <>
                             <p className="text-black/80 capitalize">{profile.billing.first_name} {profile.billing.last_name}</p>
                             <p className="text-black/80">{profile.billing.address_1}</p>
                             {profile.billing.address_2 && <p className="text-black/80">{profile.billing.address_2}</p>}
                             <p className="text-black/80">{profile.billing.city}, {profile.billing.state} {profile.billing.postcode}</p>
                             <p className="text-black/80">{profile.billing.country}</p>
                           </>
                         ) : (
                           <p className="text-black/80">No default address set.</p>
                         )}
                       </div>
                       
                       <button className="text-black hover:underline text-sm inline-block">View Addresses ({profile.billing?.address_1 ? "1" : "0"})</button>
                    </div>
                  )}
                </aside>
              </div>
            </div>
          )}
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AccountPageContent />
    </Suspense>
  );
}
