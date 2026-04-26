import { authenticateWordPressUser } from "@/lib/account-auth";
import { clearCustomerSessionCookie, getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

type WooCustomerProfile = {
  id: number;
  email: string;
};

export async function DELETE(request: Request) {
  const customerId = getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: {
    password?: string;
    confirmation?: string;
  };

  try {
    payload = (await request.json()) as {
      password?: string;
      confirmation?: string;
    };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const password = payload.password || "";
  const confirmation = (payload.confirmation || "").trim();

  if (!password) {
    return Response.json({ error: "Password is required" }, { status: 400 });
  }

  if (confirmation !== "DELETE") {
    return Response.json(
      { error: 'Please type "DELETE" to confirm account removal.' },
      { status: 400 },
    );
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const customer = await wooRequest<WooCustomerProfile>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
    );

    await authenticateWordPressUser(customer.email, password);

    await wooRequest<{ id: number }>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}?force=true`,
      {
        method: "DELETE",
      },
    );

    const response = Response.json({ message: "Your account has been deleted." });
    response.headers.append("Set-Cookie", clearCustomerSessionCookie());
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid email or password")) {
      return Response.json({ error: "Your password is incorrect." }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Password login is not enabled on WordPress")
    ) {
      return Response.json({ error: error.message }, { status: 501 });
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete account",
      },
      { status: 500 },
    );
  }
}
