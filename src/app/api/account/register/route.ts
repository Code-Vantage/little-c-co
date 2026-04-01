import { createCustomerSessionCookie } from "@/lib/customer-session";
import { linkGuestOrdersToCustomer } from "@/lib/customer-order-linking";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";
import { randomBytes } from "crypto";

type WooCustomer = {
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
  let payload: {
    email?: string;
    password?: string;
    first_name?: string;
    last_name?: string;
  };

  try {
    payload = (await request.json()) as {
      email?: string;
      password?: string;
      first_name?: string;
      last_name?: string;
    };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const email = payload.email?.trim().toLowerCase();
  const password = payload.password || "";

  if (!email) {
    return Response.json({ error: "Email is required" }, { status: 400 });
  }

  if (password.length < 8) {
    return Response.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const existingCustomers = await wooRequest<WooCustomer[]>(
      `/wp-json/wc/v3/customers?email=${encodeURIComponent(email)}`,
    );

    if (existingCustomers[0]?.id) {
      return Response.json(
        { error: "An account already exists with this email. Please login." },
        { status: 409 },
      );
    }

    const customer = await wooRequest<WooCustomer>("/wp-json/wc/v3/customers", {
      method: "POST",
      body: JSON.stringify({
        email,
        first_name: payload.first_name || "",
        last_name: payload.last_name || "",
        username: buildUsername(email),
        password,
      }),
    });

    try {
      await linkGuestOrdersToCustomer(customer.id, email);
    } catch {
      // Best effort: account creation should still succeed even if order linking fails.
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
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to create account",
      },
      { status: 500 },
    );
  }
}
