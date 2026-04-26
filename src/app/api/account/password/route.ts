import { authenticateWordPressUser } from "@/lib/account-auth";
import { getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

type WooCustomerProfile = {
  id: number;
  email: string;
};

export async function POST(request: Request) {
  const customerId = getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  let payload: {
    current_password?: string;
    new_password?: string;
  };

  try {
    payload = (await request.json()) as {
      current_password?: string;
      new_password?: string;
    };
  } catch {
    return Response.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const currentPassword = payload.current_password || "";
  const newPassword = payload.new_password || "";

  if (!currentPassword || !newPassword) {
    return Response.json(
      { error: "Current password and new password are required" },
      { status: 400 },
    );
  }

  if (newPassword.length < 8) {
    return Response.json({ error: "New password must be at least 8 characters" }, { status: 400 });
  }

  if (currentPassword === newPassword) {
    return Response.json(
      { error: "New password must be different from your current password" },
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

    await authenticateWordPressUser(customer.email, currentPassword);

    await wooRequest<WooCustomerProfile>(`/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`, {
      method: "PUT",
      body: JSON.stringify({
        password: newPassword,
      }),
    });

    return Response.json({ message: "Password updated successfully." });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Invalid email or password")) {
      return Response.json({ error: "Your current password is incorrect." }, { status: 401 });
    }

    if (
      error instanceof Error &&
      error.message.includes("Password login is not enabled on WordPress")
    ) {
      return Response.json({ error: error.message }, { status: 501 });
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to update password",
      },
      { status: 500 },
    );
  }
}
