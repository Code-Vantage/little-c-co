const CUSTOMER_COOKIE_NAME = "littlecco_customer_id";

export function getCustomerIdFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [rawKey, ...rawValueParts] = pair.trim().split("=");
    if (!rawKey) continue;

    if (rawKey === CUSTOMER_COOKIE_NAME) {
      const rawValue = rawValueParts.join("=");
      return decodeURIComponent(rawValue || "");
    }
  }

  return null;
}

export function createCustomerSessionCookie(customerId: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CUSTOMER_COOKIE_NAME}=${encodeURIComponent(String(customerId))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}

export function clearCustomerSessionCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CUSTOMER_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}
