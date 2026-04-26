import { getCustomerIdFromRequest } from "@/lib/customer-session";
import { isWooConfigured, wooRequest } from "@/lib/woocommerce";

type WooCustomerAddress = {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
};

type WooCustomerProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  billing?: WooCustomerAddress;
  shipping?: WooCustomerAddress;
};

function normalizeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function mergeAddress(
  currentAddress: WooCustomerAddress | undefined,
  incomingAddress: unknown,
): WooCustomerAddress {
  if (!incomingAddress || typeof incomingAddress !== "object") {
    return currentAddress ?? {};
  }

  const incoming = incomingAddress as WooCustomerAddress;

  return {
    first_name:
      incoming.first_name !== undefined
        ? normalizeString(incoming.first_name)
        : currentAddress?.first_name ?? "",
    last_name:
      incoming.last_name !== undefined
        ? normalizeString(incoming.last_name)
        : currentAddress?.last_name ?? "",
    company:
      incoming.company !== undefined ? normalizeString(incoming.company) : currentAddress?.company ?? "",
    address_1:
      incoming.address_1 !== undefined
        ? normalizeString(incoming.address_1)
        : currentAddress?.address_1 ?? "",
    address_2:
      incoming.address_2 !== undefined
        ? normalizeString(incoming.address_2)
        : currentAddress?.address_2 ?? "",
    city: incoming.city !== undefined ? normalizeString(incoming.city) : currentAddress?.city ?? "",
    state:
      incoming.state !== undefined ? normalizeString(incoming.state) : currentAddress?.state ?? "",
    postcode:
      incoming.postcode !== undefined
        ? normalizeString(incoming.postcode)
        : currentAddress?.postcode ?? "",
    country:
      incoming.country !== undefined
        ? normalizeString(incoming.country)
        : currentAddress?.country ?? "",
    email:
      incoming.email !== undefined ? normalizeString(incoming.email) : currentAddress?.email ?? "",
    phone:
      incoming.phone !== undefined ? normalizeString(incoming.phone) : currentAddress?.phone ?? "",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId") ?? getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const profile = await wooRequest<WooCustomerProfile>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
    );
    return Response.json(profile);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId") ?? getCustomerIdFromRequest(request);

  if (!customerId) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (!isWooConfigured()) {
    return Response.json({ error: "WooCommerce is not configured" }, { status: 503 });
  }

  try {
    const payload = (await request.json()) as Partial<WooCustomerProfile>;
    const currentProfile = await wooRequest<WooCustomerProfile>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
    );

    const nextEmail =
      payload.email !== undefined ? normalizeString(payload.email).trim().toLowerCase() : currentProfile.email;

    if (!nextEmail) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const profile = await wooRequest<WooCustomerProfile>(
      `/wp-json/wc/v3/customers/${encodeURIComponent(customerId)}`,
      {
        method: "PUT",
        body: JSON.stringify({
          first_name:
            payload.first_name !== undefined
              ? normalizeString(payload.first_name)
              : currentProfile.first_name,
          last_name:
            payload.last_name !== undefined
              ? normalizeString(payload.last_name)
              : currentProfile.last_name,
          email: nextEmail,
          billing: mergeAddress(currentProfile.billing, payload.billing),
          shipping: mergeAddress(currentProfile.shipping, payload.shipping),
        }),
      },
    );
    return Response.json(profile);
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
