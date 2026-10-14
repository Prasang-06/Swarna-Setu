# SwarnaSetu — Jewellery Marketplace MVP Demo

A Next.js + React + TypeScript starter for an Indian multi-vendor jewellery marketplace. Built as an editable prototype for review in Antigravity. **This is not production-ready and does not connect to a real database, authentication provider, notification channel, or payment gateway.**

## Included in this build

- Customer storefront with catalogue search, category/purity filters, sorting, favourites and responsive navigation.
- Public shop profiles and product detail pages.
- Customer demo booking/custom-design request form that creates a local record assigned to the intended sample shop.
- Customer booking lookup using order reference + phone (sample-only; no real authentication).
- Jeweller dashboard with shop switching for demonstration, profile editor, add/edit/publish product listings, and order/contact-status management.
- Admin dashboard for user management, shop approval/suspension, product moderation and controlled admin editing with required reason, order routing oversight, demo payment statuses/refunds, notification broadcasts, analytics, CSV exports, audit log and demo settings/reset.
- Local browser persistence using `localStorage`, so edits and newly created orders persist in the same browser profile.
- Responsive mobile navigation, theme toggle, favicon, page metadata, custom 404, toasts, empty/error states and reduced-motion accommodation.
- Sample data for three approved shops, one pending shop, jewellery and illustrative orders.

## Important demo boundaries

- All shop names, people, products, ratings, prices, payments and orders are illustrative sample data.
- The product/order state is stored in the current browser using `localStorage`. This is not a shared database and is not secure for real customer data.
- “Simulate paid”, refunds, notifications, shop verification, user suspension and routing changes only alter local demo data. No real transaction, message, refund or verification is performed.
- The booking modal uses a simple illustrative 5% deposit calculation. This must be replaced by the amount in a shop-confirmed quotation and an approved payment-provider arrangement.
- Authentication is not implemented. The role switcher is only for previewing different shop experiences. Never deploy as a real marketplace without authentication, server-side authorization and data isolation.
- Product image URLs use public Unsplash demo imagery. Replace with authorized shop photographs and secure, optimized object storage before launch.
- CSV reports contain local demo records only.

## Run locally

Requirements: Node.js 22+ and npm.

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

Create a production build check:

```bash
npm run build
```

## Routes

- `/` — customer marketplace
- `/shops/sona-heritage` — sample shop profile
- `/shops/aarika-jewels` — sample shop profile
- `/shops/rajwada-gold-house` — sample shop profile
- `/product/prod-001` — sample product detail
- `/account` — sample booking lookup
- `/seller` — jeweller dashboard demo
- `/admin` — administrator dashboard demo

## Antigravity handoff suggestion

Open the folder after extracting the ZIP. Ask Antigravity to inspect the README and existing architecture before modifying it. Work in small, reviewable steps rather than replacing the app wholesale.

Recommended implementation sequence after you approve this demo:

1. Confirm exact requirements and UX with pilot jewellers.
2. Choose authentication (e.g. Firebase Auth, Clerk or Auth0) and a PostgreSQL-backed data layer.
3. Design and test shop-level authorization and admin roles server-side.
4. Replace browser-only state with database-backed APIs/actions and object storage.
5. Define shop-direct deposit routing, refund and settlement policy with an approved payment provider.
6. Integrate server-verified payment webhooks, notification provider and audit logging.
7. Add security testing, backup/restore, image optimization, load tests and production observability.

## Environment variables

`.env.example` contains placeholders for future services. Do not add production keys to browser-exposed `NEXT_PUBLIC_` variables unless the provider explicitly marks them safe for public use. Never commit secrets.
