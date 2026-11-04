# Instagram Feed Setup Guide

The homepage Instagram section shows the 3 latest posts from the Little c co. account. It uses the **Instagram API with Instagram Login** (`graph.instagram.com`). Tokens from Facebook Login or the Graph API Explorer will **not** work.

The only thing the site needs is one environment variable: `INSTAGRAM_ACCESS_TOKEN`.

## Step 1 — Make the account Professional
1. Open the Instagram app → **Settings** → **Account type and tools**
2. Tap **Switch to professional account** → choose **Business** or **Creator**

No Facebook Page is needed.

## Step 2 — Create a Meta app
1. Go to **[developers.facebook.com/apps](https://developers.facebook.com/apps)** → **Create app**
2. Choose the **Business** app type (required for this API; an app of another type must be replaced)
3. Name it anything (e.g. "LittleCCo Website")

## Step 3 — Add the Instagram product
1. In the app dashboard, click **Add product** → **Instagram**
2. Open **API setup with Instagram business login**

## Step 4 — Add your account as a tester
1. In the app dashboard go to **App roles** → **Roles** → **Instagram testers** and add the Instagram account
2. In the Instagram app, accept the invite: **Settings** → **Apps and websites** → **Tester invites**

The app only reads your own account, so it can stay in **Development** mode and does not need App Review.

## Step 5 — Generate the token
1. Back in **API setup with Instagram business login**, click **Generate token** next to the account
2. Approve the `instagram_business_basic` permission
3. Copy the token

Dashboard tokens are already long-lived (**60 days**), so there is no token-exchange step.

## Step 6 — Test the token
Open this in a browser (replace `TOKEN`):
```
https://graph.instagram.com/me?fields=user_id,username&access_token=TOKEN
```
You should get your username back. An error here means the token is wrong, so fix it before continuing.

## Step 7 — Add it to the project
1. In `.env.local` in the project root:
   ```env
   INSTAGRAM_ACCESS_TOKEN=your_token_here
   ```
2. Restart `npm run dev`
3. Add the same variable in your hosting provider's environment settings and **redeploy** (`.env.local` is not deployed)

## Step 8 — Check the homepage
The 3 latest posts should appear in the "Little details, lately." section. Grey placeholder boxes mean the token is missing, wrong or expired.

## Token lifetime and renewal
- Tokens last **60 days**. They can be refreshed if they are at least 24 hours old and **not yet expired**. An expired token cannot be refreshed. You must repeat Step 5.
- The component tries to refresh the token on every request, which keeps it alive as long as the site gets visits.
- Errors are swallowed, so an expired token shows grey boxes with no error message. If the site gets no traffic for 60 days, the token dies.
- **Backup:** set a calendar reminder to regenerate the token (Step 5) and update the env var every ~50 days.

## How it works in the codebase
- **`src/components/instagram.tsx`** is an async server component. It calls `graph.instagram.com/me/media` directly (3 latest posts, cached for 1 hour), then renders thumbnails that link to each post. If the token is missing or any call fails, it renders placeholders.
- **`src/app/page.tsx`** renders `<Instagram />`. The page is `force-dynamic`, so the token refresh call runs on every visit. Only the media fetch is cached.
- **`src/app/api/instagram/route.ts`** is currently **not used** by anything. The component does not call it.
- The profile link ("View Instagram" button and footer icon) is hardcoded to `https://www.instagram.com/littlecmakes/`.

## Troubleshooting
| Symptom | Likely cause |
|---|---|
| Grey boxes, nothing else | Token missing, expired or wrong type. Run the Step 6 test URL. |
| Step 6 returns an OAuth/190 error | Token expired or was generated with Facebook Login instead of the Instagram dashboard |
| Works locally, grey boxes in production | Env var not added to the host, or no redeploy after adding it |
| Account can't be selected in the dashboard | Tester invite not accepted (Step 4) or account is not Professional |
