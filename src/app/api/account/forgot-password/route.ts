import { isWooConfigured } from "@/lib/woocommerce";

export async function POST(request: Request) {
  let payload: { email?: string };

  try {
    payload = (await request.json()) as { email?: string };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  const siteUrl = process.env.WOOCOMMERCE_SITE_URL?.replace(/\/$/, "");
  if (!siteUrl) {
    return Response.json({ error: "WOOCOMMERCE_SITE_URL is not configured" }, { status: 503 });
  }

  try {
    const formData = new URLSearchParams({
      user_login: email,
      "wp-submit": "Get New Password",
      redirect_to: "",
    });

    const response = await fetch(`${siteUrl}/wp-login.php?action=lostpassword`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
      redirect: "manual",
      cache: "no-store",
    });

    if (response.status >= 500) {
      throw new Error(`WordPress returned status ${response.status}`);
    }

    return Response.json({
      ok: true,
      message: "If an account exists for this email, password reset instructions have been sent.",
    });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to request password reset",
      },
      { status: 500 },
    );
  }
}
