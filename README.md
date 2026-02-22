# FOREIGN Storefront

A gallery-style clothing storefront modeled after a password-gated weekend-drop flow, with account auth, cart behavior, legal pages, and admin role permissions.

## Features
- Password-gated storefront entry (`/` unlocks with store password)
- Product collection + product detail pages
- Cart add/remove/update with local persistence
- SMS authentication (OTP) for account access
- Owner/admin role management for phone numbers/accounts
- Footer policy/legal links and brand info pages

## Stack
- Next.js (App Router) + TypeScript
- Prisma + SQLite
- Twilio SMS API (fallback mock logging if credentials are empty)

## Setup
1. Install Node.js 20+.
2. Configure env:
```bash
cp .env.example .env
```
3. Install dependencies and Prisma client:
```bash
npm install
npm run prisma:generate
```
4. Create DB + seed roles/permissions:
```bash
npx prisma migrate dev --name init
npm run prisma:seed
```
5. Start app:
```bash
npm run dev
```

Open `http://localhost:3000`.

## Required environment values
- `DATABASE_URL`
- `OTP_PEPPER`, `SESSION_PEPPER`
- `OWNER_PHONES` (comma-separated E.164 numbers)
- `STORE_PASSWORD` (storefront unlock password)

Optional for real SMS:
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `SMS_FROM`

## Routes
- `/` password gate (or storefront if unlocked)
- `/collections/all`
- `/products/jump-the-line`
- `/cart`
- `/account` (SMS auth)
- `/admin` (role-based access)
- `/contact`, `/foundation`, `/shipping`, `/privacy`, `/terms`

## Notes
- Without Twilio credentials in development, OTP is logged and returned as `debugCode` by auth API.
- Cart is client-side (`localStorage`) and intended as storefront behavior demo.
- `Jump The Line` and other catalog items are defined in `src/lib/products.ts`.
