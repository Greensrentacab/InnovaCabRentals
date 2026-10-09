# Innova Cab Rentals — Bangalore

A lead-generation website for **Innova Cabs Bangalore**, a chauffeur-driven Toyota Innova / Innova Crysta rental service. There is no self-serve checkout: visitors get instant fare estimates, submit a booking **request**, and the business confirms every trip manually by phone or WhatsApp.

> The authoritative business/product spec lives in [`PROJECT_CONTEXT.md`](./PROJECT_CONTEXT.md) — read it before making product changes. The full visual/component spec lives in [`design.md`](./design.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS 3 (custom design tokens — see `tailwind.config.ts`) |
| Database / Auth | Firebase (Cloud Firestore + Firebase Auth for the admin console) |
| Server-side DB access | `firebase-admin` (service account) |
| Location autocomplete | Google Places API |
| Transactional email | Resend |
| Validation | Zod |
| Icons | lucide-react |
| Hosting | Vercel (primary) / Netlify (`netlify.toml` present) |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real credentials, see below
npm run dev                  # http://localhost:3000
```

Other scripts:

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # next lint
npm run seed    # push seed vehicles & routes into Firestore (scripts/seed.ts)
```

`predev` wipes the `.next` cache automatically before every `dev` run.

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

- **Firebase client config** (`NEXT_PUBLIC_FIREBASE_*`) — public, read-only.
- **Firebase Admin SDK** (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) — service account for server actions/API routes.
- **Google Places API** (`NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACES_API_KEY`) — pickup/drop autocomplete.
- **Resend** (`RESEND_API_KEY`, `ADMIN_EMAIL`, `NOTIFICATION_EMAIL_FROM`) — booking/enquiry notification emails.
- **Site metadata** (`NEXT_PUBLIC_SITE_URL`, `ADMIN_PHONE`).
- **`RELEASED_ROUTES`** — client-reveal gate (see below). Defaults to `*` (everything public).

Without Firebase Admin credentials configured, the app falls back to an in-memory data store (`lib/adminStore.ts`) seeded with sample bookings/routes/vehicles — handy for local development without a live Firestore project.

## Project structure

```
app/                     Next.js App Router pages & API routes
  page.tsx               Homepage (single-page lead-gen landing)
  airport-taxi/          Airport transfer landing page
  outstation-cabs/       Outstation trips landing page
  local-rides/           Local/half-day & full-day rentals
  tour-packages/         Enquiry-based tour packages
  vehicles/              Fleet overview
  innova-*-rental-bangalore/   SEO landing pages per vehicle model
  ertiga-rental-bangalore/
  routes/, routes/[slug]/      Outstation route catalog & detail pages
  booking/[bookingId]/   Booking lookup/status page
  booking/confirmed/     Post-submit confirmation page
  about/, contact/, faq/ Static content pages
  coming-soon/           Branded placeholder shown by the route gate
  admin/, admin/login/   Admin console (bookings, pricing, enquiries)
  api/bookings/          Create & fetch bookings (server-validated fare)
  api/fare/              Fare estimate endpoint
  actions/               Server Actions (admin.ts, booking.ts, enquiry.ts)

components/              UI components (header, footer, booking widget, forms…)
  ds/                     Shared design-system primitives (hero, rate list, etc.)
  home/                   Homepage-specific sections (hero widget, FAQ, fleet…)
  admin/                  Admin-only components (vehicle rates editor)

context/                 React context (BookingFlowContext)

lib/                     Server/shared logic
  types.ts               Core domain types (Booking, Vehicle, Route, Driver…)
  fareCalculator.ts       Server-side fare computation (never trust client price)
  adminStore.ts           Firestore access + in-memory fallback for bookings/routes/vehicles
  firebase.ts / firebaseAdmin.ts   Client & Admin SDK initialization
  routeCatalog.ts         Static catalog of outstation routes
  siteConfig.ts           Site-wide constants (phone, address, etc.)
  emailService.ts         Resend transactional emails
  googlePlaces.ts         Places Autocomplete helper
  rateLimit.ts            IP-based rate limiting for booking submissions
  time.ts, cn.ts, fleetPhotos.ts, storefrontData.ts

scripts/seed.ts          Seeds Firestore with starter vehicles & routes
middleware.ts            "Coming Soon" route gate (see below)
firestore.rules          Firestore security rules
```

## Core business rules

These are enforced throughout the codebase and should not be violated by future changes (full detail in `PROJECT_CONTEXT.md`):

1. **No self-serve checkout.** A booking submission creates a `PENDING` request; the admin confirms it with the customer directly (call or a pre-filled `wa.me` WhatsApp link). No payment gateway, no WhatsApp Business API.
2. **Never invent prices.** All fares in Firestore are nullable and admin-editable. A `null` price renders as *"Price on request"* with a WhatsApp quick-quote CTA — anywhere in the UI.
3. **Never fabricate testimonials/reviews.** The testimonials section stays hidden until real, client-supplied Google reviews are wired in.
4. **NAP consistency.** Business name, phone, and address must be byte-for-byte identical across header, footer, contact page, and JSON-LD schema.
5. **Server-trusted fares.** `POST /api/bookings` always recalculates the fare server-side via `lib/fareCalculator.ts` — the client-submitted price is never trusted.
6. **Mobile-first.** Most traffic is paid mobile ads; touch targets are ≥44px and a sticky mobile dock (call/WhatsApp/book) is always present below `lg`.

## Data model

Defined in `lib/types.ts`:

- **`Vehicle`** — fleet entry (Innova, Innova Crysta, Ertiga, Innova Hycross [`confirmed: false`]) with a nullable `VehicleRates` tariff (airport fare, outstation per-km, local 8h/12h packages, driver allowance, overage rates).
- **`Route`** — outstation route catalog entry (origin/destination/distance/duration) with legacy per-vehicle fixed fares.
- **`Booking`** — a customer request: pickup/drop, trip & service type, date/time, vehicle, server-calculated `fare`, and a `bookingStatus` lifecycle: `PENDING → CONFIRMED → DRIVER_ASSIGNED → TRIP_STARTED → COMPLETED` (or `CANCELLED`).
- **`Driver`** — assigned chauffeur/vehicle registration, used once a booking is confirmed.
- **`Enquiry`** — tour-package enquiry (`PENDING → CONTACTED → CONVERTED/CANCELLED`).

`lib/adminStore.ts` reads/writes these via the Firebase Admin SDK when credentials are present, otherwise it operates on an in-memory store seeded from `scripts/seed.ts` — so the app is fully runnable without a live Firebase project.

## Admin console

`/admin` (behind `/admin/login`) lets staff:

- Review and update booking status, assign a driver/vehicle registration.
- Edit per-vehicle pricing (`VehicleRates`) — the only place prices are ever set.
- Review tour-package enquiries.

`/admin`, `/api/*`, and `/coming-soon` are always reachable regardless of the route gate below.

## "Coming soon" route gate

`middleware.ts` can hide parts of the site behind a branded **Coming Soon** page without a code deploy:

- `RELEASED_ROUTES` unset or `"*"` (default) → entire site public.
- Otherwise, set it to a comma-separated allow-list of paths that **should stay public** (e.g. `"/,/about,/contact,/routes/*"`); everything else rewrites to `/coming-soon`.
- A trailing `/*` releases a path and everything nested under it.
- Change it in Vercel/Netlify's environment variables and redeploy — no code change needed.

## Design system

The full visual spec — color tokens, typography scale, component markup (header, booking widget, cards, calendar, etc.), spacing, shadows, and motion — is documented in [`design.md`](./design.md). Shared component classes (`.btn-primary`, `.card-float`, `.field`, `.glass`, …) live in `app/globals.css` under `@layer components`.

## Deployment

- **Vercel**: default target: push to the connected branch; env vars configured in Project Settings.
- **Netlify**: `netlify.toml` is present as an alternative target.

Set all required environment variables (see above) in whichever platform you deploy to, then redeploy after any `RELEASED_ROUTES` change.
