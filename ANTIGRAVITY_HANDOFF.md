# Antigravity Handoff — SwarnaSetu

This folder contains the editable SwarnaSetu marketplace MVP demo. Start by understanding the current structure before making broad changes.

## First steps

1. Read `README.md` and inspect the `app/`, `components/`, and `lib/` folders.
2. Run `npm install`, then `npm run dev`.
3. Open the customer site at `/`, jeweller workspace at `/seller`, admin dashboard at `/admin`, and account lookup at `/account`.
4. Run `npm run build` and address any build/type errors before adding functionality.
5. Keep demo behaviour clearly labelled and do not imply any real payments or notifications are connected.

## Current architecture

- Next.js App Router + React + TypeScript.
- Custom responsive CSS in `app/globals.css`.
- `components/demo-store.tsx` contains the browser-local demo state and sample-data persistence.
- `lib/types.ts` defines the domain types.
- `lib/seed.ts` defines illustrative shops, products, users, orders, notifications and audit entries.
- No real backend, authentication, payment provider, notification delivery or production authorization exists yet.

## Critical product rules to preserve

- An order must remain assigned to the correct shop that owns the product or issued the accepted quotation.
- The admin dashboard must be able to monitor routing, contact status, order status, and investigate/correct assignment with an audit reason.
- Shop owners only see their own shop's data in the production design; platform-wide reporting is admin-only.
- Shops require admin approval before public publication.
- Admin content changes require a reason and audit trail; real production should preserve before/after versions and notify affected shops as appropriate.
- Deposits are intended to go directly to the shop owner. Payment-provider setup, refund authority, and settlement/reconciliation rules must be verified before live payments.
- Use an established authentication provider (Firebase Auth, Clerk, Auth0 or approved alternative); do not invent password storage or session management.
- Never treat browser `localStorage`, a browser redirect, or a browser-supplied payment status as secure evidence for production.

## Next implementation milestones after the demo is reviewed

1. Capture shopkeeper feedback and finalise workflows.
2. Select auth provider and PostgreSQL-backed data architecture.
3. Implement server-side access controls and shop-level tenant isolation.
4. Move catalogue, profiles, enquiries, quotes, orders, notifications and audit records to the database.
5. Add secure object storage and file validation for product photos and private design references.
6. Integrate an appropriate shop-direct deposit payment arrangement, verified webhooks and a controlled refund policy.
7. Integrate transactional notifications, operational monitoring, backup/restore, load tests and security tests.
