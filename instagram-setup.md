# Instagram Graph API Setup Guide

## Step 1 — Convert Instagram to Professional Account
1. Open Instagram app → **Settings** → **Account**
2. Tap **Switch to Professional Account** → choose **Creator** or **Business**

## Step 2 — Link to a Facebook Page
1. In Instagram settings → **Account** → **Linked Accounts** → **Facebook**
2. Connect to any Facebook Page you own (can create a dummy one if needed)

## Step 3 — Create a Meta Developer App
1. Go to **[developers.facebook.com/apps](https://developers.facebook.com/apps)** → **Create App**
2. Select **"Other"** → **"Business"** type
3. Give it any name (e.g. "LittleCCo Website")
4. On the app dashboard, click **Add Product** → find **Instagram** → click **Set Up**

## Step 4 — Get Your Access Token
1. In your app, go to **Tools** → **Graph API Explorer**
2. In the top-right dropdown, select your app
3. Under **User or Page**, click **Generate Access Token** → log in and allow all permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `instagram_content_publish`
4. Copy the short-lived token shown

## Step 5 — Exchange for a Long-Lived Token
Run this URL in your browser (replace the placeholders):
```
https://graph.facebook.com/oauth/access_token?grant_type=fb_exchange_token&client_id={APP_ID}&client_secret={APP_SECRET}&fb_exchange_token={SHORT_TOKEN}
```
Copy the `access_token` from the JSON response — this lasts **60 days**.

> Find `APP_ID` and `APP_SECRET` under your app → **Settings** → **Basic**

## Step 6 — Add to the project
Create or edit `.env.local` in the project root:
```env
INSTAGRAM_ACCESS_TOKEN=your_long_lived_token_here
```

## Token Auto-Refresh
The API route at `/api/instagram` automatically calls the token refresh endpoint on every request,
so as long as the site is visited at least once every 60 days, the token never expires.

## How it works in the codebase
- **`src/app/api/instagram/route.ts`** — Server-side route that calls the Instagram Graph API,
  refreshes the token, and returns the 3 latest posts. Results cached for 1 hour.
- **`src/components/instagram.tsx`** — Async server component that fetches from the API route
  and renders clickable post thumbnails that link directly to the Instagram post.
