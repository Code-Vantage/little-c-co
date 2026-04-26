type WordPressAuthResponse = {
  success?: boolean;
  data?: {
    jwt?: string;
    user?: {
      email?: string;
      display_name?: string;
    };
  };
  message?: string;
  error?: string;
};

export type AuthenticatedWordPressUser = {
  email: string;
  displayName: string;
};

function getWordPressAuthUrl() {
  const siteUrl = process.env.WOOCOMMERCE_SITE_URL?.replace(/\/$/, "");

  if (!siteUrl) {
    throw new Error("WOOCOMMERCE_SITE_URL is not configured");
  }

  return `${siteUrl}/index.php?rest_route=/simple-jwt-login/v1/auth`;
}

export async function authenticateWordPressUser(
  email: string,
  password: string,
): Promise<AuthenticatedWordPressUser> {
  const response = await fetch(getWordPressAuthUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
    cache: "no-store",
  });

  const data = (await response.json()) as WordPressAuthResponse;

  if (!response.ok || !data.success || !data.data?.jwt) {
    if (response.status === 404) {
      throw new Error(
        "Password login is not enabled on WordPress. Install and configure the Simple JWT Login plugin.",
      );
    }

    throw new Error(data.message || data.error || "Invalid email or password");
  }

  return {
    email: (data.data.user?.email || email).trim().toLowerCase(),
    displayName: data.data.user?.display_name || "",
  };
}
