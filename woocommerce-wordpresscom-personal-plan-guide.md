# WooCommerce + Next.js Setup Guide (WordPress.com Personal Plan)

## Important First Reality Check

You currently have a **WordPress.com Personal plan**.

For your use case (WooCommerce + headless Next.js), the Personal plan is not enough.

Why:
- Personal plan does **not** allow installing WooCommerce plugin.
- Personal plan does **not** allow installing custom plugins for REST auth/payment extensions.
- Personal plan does **not** provide the full ecommerce feature set needed for real checkout/payments.

## What You Must Do First

You have two valid paths:

1. Upgrade your WordPress.com plan to a WooCommerce-capable plan.
2. Move to self-hosted WordPress.org hosting (e.g., SiteGround, Cloudways, Kinsta, etc.).

For simplicity, this guide assumes you stay on **WordPress.com** and upgrade.

---

## Section 1: Upgrade Path on WordPress.com

### Step 1. Log in to WordPress.com
- Go to https://wordpress.com
- Open your site dashboard.

### Step 2. Check your current plan
- In dashboard, open `Upgrades` -> `Plans`.
- Confirm it currently shows `Personal`.

### Step 3. Upgrade to a plan that supports WooCommerce
- Select a plan that explicitly includes WooCommerce support (Business/Commerce depending on current WordPress.com naming).
- Complete payment.

### Step 4. Verify plugin installation is unlocked
- In dashboard, open `Plugins`.
- If plugin install is available, your plan is now suitable.
- If not, contact WordPress.com support and ask: "I need WooCommerce plugin installation and API access for headless frontend."

---

## Section 2: Install and Configure WooCommerce in WordPress.com

### Step 5. Install WooCommerce plugin
- Go to `Plugins` -> `Add New`.
- Search `WooCommerce`.
- Click `Install` then `Activate`.

### Step 6. Run WooCommerce onboarding wizard
- Set store details:
  - Store country
  - Currency
  - Product type (physical/digital)
  - Unit preferences
- Keep defaults initially if unsure.

### Step 7. Configure permalinks
- Go to `Settings` -> `Permalinks`.
- Select `Post name`.
- Save.

This helps clean API and product URLs.

### Step 8. Set shipping basics
- Go to `WooCommerce` -> `Settings` -> `Shipping`.
- Add at least one shipping zone.
- Add one shipping method (Flat rate or Free shipping for testing).

### Step 9. Set tax behavior (if applicable)
- Go to `WooCommerce` -> `Settings` -> `Tax`.
- Enable/disable according to your local requirements.

### Step 10. Configure account behavior
- Go to `WooCommerce` -> `Settings` -> `Accounts & Privacy`.
- Enable:
  - Customer account creation during checkout
  - Login on checkout (optional, recommended)

---

## Section 3: Add Payments (WooCommerce Payments)

### Step 11. Install WooCommerce Payments
- Go to `Plugins` -> `Add New`.
- Search for `WooCommerce Payments`.
- Install and activate.

### Step 12. Connect payment account
- Go to `WooCommerce` -> `Settings` -> `Payments`.
- Enable `WooCommerce Payments`.
- Connect your Stripe-backed account flow through the wizard.

### Step 13. Enable test mode first
- Keep sandbox/test mode enabled initially.
- Use test cards until end-to-end flow is validated.

---

## Section 4: Prepare WooCommerce API for Next.js

### Step 14. Create WooCommerce REST API keys
- Go to `WooCommerce` -> `Settings` -> `Advanced` -> `REST API`.
- Click `Add key`.
- Set:
  - Description: `Next.js Frontend`
  - Permissions: `Read/Write`
- Save the generated:
  - Consumer Key (`ck_...`)
  - Consumer Secret (`cs_...`)

Store them securely. You may not see the secret again.

### Step 15. Confirm API endpoint is reachable
- Base endpoint format:
  - `https://yourdomain.com/wp-json/wc/v3/`

Test products endpoint with keys from server-side only.

---

## Section 5: Connect Your Existing Next.js Project

Your project already expects these env vars.

### Step 16. Create environment file
- In your Next.js project root, create `.env.local`.
- Add:

```env
WOOCOMMERCE_SITE_URL=https://your-wordpress-domain.com
WOOCOMMERCE_CONSUMER_KEY=ck_xxxxxxxxxxxxxxxxxxxxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxxxxxxxxxxxxxxxxxxxx
```

### Step 17. Restart Next.js dev server
- After env changes, restart the server.

### Step 18. Verify frontend data flow
- Open Home page and Shop page.
- Confirm products are loaded from WooCommerce (not demo fallback).

---

## Section 6: Add Real Store Data

### Step 19. Create categories
- `Products` -> `Categories`.
- Add your product categories first.

### Step 20. Create products
For each product add:
- Title
- Slug
- Short description
- Full description
- Price
- Stock status
- Main image
- Gallery images
- Category

### Step 21. Publish at least 6 to 12 products
This gives a realistic layout for your Home/Shop/Product page design implementation.

---

## Section 7: Headless-Specific Production Checklist

### Step 22. Keep API keys server-only
- Never expose consumer key/secret in browser code.
- Use Next.js server routes for all WooCommerce calls.

### Step 23. Domain and SSL
- Ensure both frontend and WordPress use HTTPS.
- Mixed content will break image/payment flows.

### Step 24. Cache and media
- Optimize product images in WordPress media library.
- Use CDN/optimization available on your plan.

### Step 25. Security basics
- Enable 2FA on WordPress admin account.
- Use strong admin password.
- Limit admin users.

### Step 26. Backup strategy
- Verify your WordPress.com backup availability.
- Keep periodic export backups of products/orders if needed.

---

## Section 8: What Is Not Possible on Personal Plan (No Upgrade)

If you stay on Personal plan, these are blocked:
- Installing WooCommerce plugin
- Running a real ecommerce checkout
- WooCommerce payments setup
- WooCommerce REST API keys for headless store operations

In that case, your options are:
1. Upgrade WordPress.com plan (recommended for your current path).
2. Migrate to self-hosted WordPress.org.

---

## Section 9: Deployment Order (Recommended)

1. Upgrade WordPress.com plan.
2. Install/configure WooCommerce + payments in test mode.
3. Create API keys.
4. Wire env vars in Next.js.
5. Validate product listing and product detail.
6. Implement Figma-based Home/Shop/Product UI.
7. Build remaining pages in the same style system.
8. Switch payments to live mode only after end-to-end test.

---

## Section 10: Figma Handoff for Your Current Scope

You said final design source will be Figma for these 3 pages:
- Home
- Shop (all products)
- Product page

Once you share those Figma links/node IDs, implementation should follow this order:
1. Build exact Home page.
2. Build exact Shop page.
3. Build exact Product page.
4. Extract design rules (spacing, type scale, colors, cards, buttons, form styles).
5. Apply same design language to remaining pages.

---

## Quick Troubleshooting

### Error: "Missing WooCommerce credentials"
- `.env.local` missing one or more required variables.
- Restart dev server after editing env.

### Products not appearing
- WooCommerce products might be draft/private.
- API user permissions may be wrong.
- Site URL in env may be incorrect.

### API 401/403
- Wrong API keys
- Keys revoked
- Permissions not set to Read/Write

### Payments not available
- WooCommerce Payments not connected
- Store country/currency not supported by selected gateway
- Test mode not configured

---

## Final Recommendation for Your Exact Situation

Because you already purchased **WordPress.com Personal**, the immediate next action is:

1. Upgrade plan to WooCommerce-capable tier.
2. Complete Sections 2 to 5 in this guide.
3. Share your Figma designs for Home, Shop, and Product pages.

Then implementation can continue with accurate UI development exactly as requested.
