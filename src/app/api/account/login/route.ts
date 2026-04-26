import { createCustomerSessionCookie } from "@/lib/customer-session";
import { linkGuestOrdersToCustomer } from "@/lib/customer-order-linking";
import { authenticateWordPressUser } from "@/lib/account-auth";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";
import { randomBytes } from "crypto";

type CustomerMatch = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

function buildUsername(email: string) {
  const base = email.split("@")[0]?.toLowerCase().replace(/[^a-z0-9._-]/g, "") || "customer";
  const suffix = randomBytes(3).toString("hex");
  return `${base.slice(0, 25)}_${suffix}`;
}

export async function POST(request: Request) {
  let payload: { email?: string; password?: string };

  try {
    payload = (await request.json()) as { email?: string; password?: string };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password || "";

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }
  if (!password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const authenticatedUser = await authenticateWordPressUser(email, password);
    const authenticatedEmail = authenticatedUser.email;

    const matches = await wooRequest<CustomerMatch[]>(
      `/wp-json/wc/v3/customers?email=${encodeURIComponent(authenticatedEmail)}`,
    );

    let customer = matches[0];
    if (!customer) {
      const displayName = authenticatedUser.displayName;
      const [firstName = "", ...rest] = displayName.trim().split(/\s+/);
      const lastName = rest.join(" ");

      customer = await wooRequest<CustomerMatch>("/wp-json/wc/v3/customers", {
        method: "POST",
        body: JSON.stringify({
          email: authenticatedEmail,
          first_name: firstName,
          last_name: lastName,
          username: buildUsername(authenticatedEmail),
          password: randomBytes(12).toString("hex"),
        }),
      });
    }

    try {
      await linkGuestOrdersToCustomer(customer.id, authenticatedEmail);
    } catch {
      // Best effort: login should still succeed even if order linking fails.
    }

    const response = Response.json({
      id: customer.id,
      email: customer.email,
      first_name: customer.first_name,
      last_name: customer.last_name,
    });

    response.headers.append("Set-Cookie", createCustomerSessionCookie(customer.id));
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid email or password")) {
      return Response.json({ error: error.message }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Password login is not enabled on WordPress")
    ) {
      return Response.json({ error: error.message }, { status: 501 });
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to login",
      },
      { status: 500 },
    );
  }
}
