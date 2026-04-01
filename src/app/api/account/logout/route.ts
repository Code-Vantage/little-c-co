import { clearCustomerSessionCookie } from "@/lib/customer-session";

export async function POST() {
  const response = Response.json({ ok: true });
  response.headers.append("Set-Cookie", clearCustomerSessionCookie());
  return response;
}
