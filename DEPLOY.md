# Deploying to Vercel

This is a standard Next.js 14 (App Router) app. Vercel detects it automatically.

## 1. Push the code

Commit and push this folder to GitHub (the repo already has the `origin` remote
`github.com/rahulskiran/InnovaCabRentals`).

## 2. Import into Vercel

1. vercel.com → **Add New… → Project** → import the GitHub repo.
2. **Root Directory:** leave as the repo root if `package.json` is at the top of
   the repo. If the repo contains an `InnovaCabRentals/` folder, set Root
   Directory to `InnovaCabRentals`.
3. Framework preset: **Next.js** (auto). Build command `npm run build`, output
   default. Node.js **20.x** (Project Settings → General).
4. `vercel.json` pins serverless functions to **Mumbai (`bom1`)** for low latency in India.

## 3. Environment variables (Project Settings → Environment Variables)

| Variable | Required | Notes |
|---|---|---|
| `ADMIN_PASSWORD` | **Yes** | Admin login is disabled in production until this is set. Use a long, unique password. |
| `ADMIN_SESSION_SECRET` | Recommended | Signs the admin session cookie (defaults to `ADMIN_PASSWORD`). |
| `FIREBASE_PROJECT_ID` | **Yes** for real use | Without Firebase, bookings, enquiries and price changes live in server memory and are **lost** between requests/deploys on Vercel. Admin shows a warning banner when this is missing. |
| `FIREBASE_CLIENT_EMAIL` | **Yes** for real use | From the Firebase service-account JSON. |
| `FIREBASE_PRIVATE_KEY` | **Yes** for real use | Paste the key with `\n` line breaks (as in the JSON). |
| `NEXT_PUBLIC_FIREBASE_*` (6 vars) | For live booking tracking | Web app config from Firebase console. |
| `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY` | Recommended | Enables real address / pincode search. Restrict it to your domain in Google Cloud. Without it a small built-in Bangalore list is used. |
| `RESEND_API_KEY`, `ADMIN_EMAIL`, `NOTIFICATION_EMAIL_FROM` | Optional | New-booking email alerts. |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | For phone/desktop alerts | Firebase console → Project settings → Cloud Messaging → Web Push certificates → Generate key pair; copy the key. Also needs the Firebase admin variables above. |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Your live domain, e.g. `https://www.example.com` (share previews / SEO). |
| `RELEASED_ROUTES` | Optional | Leave unset to keep the whole site public. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | For image uploads | Admin → Homepage images uploads go to Cloudinary (free plan is enough). Without them uploads are switched off and the built-in pictures show. |

See `.env.example` for the full list with descriptions. After changing
variables, **redeploy** (Deployments → … → Redeploy).

## 4. After the first deploy

1. Open `/admin/login`, sign in with `ADMIN_PASSWORD`.
2. **Pricing & Tariffs:** enter each car's rates (empty = "Price on request").
3. Firestore: the new cars (Ertiga) and 33 routes appear automatically from the
   built-in catalogue; your edits are saved to Firestore.
4. **Homepage Images:** replace any homepage picture (festival pictures etc.)
   and press Publish — live immediately, no redeploy.
5. **Terms & Policies:** review the Terms & Conditions and each service's
   inclusions / exclusions, then Publish (shown on `/terms-and-conditions`, the service
   pages and with every fare).
6. Optional: deploy `firestore.rules` from the Firebase console/CLI.
7. Add your custom domain under Project Settings → Domains.
8. **Booking alerts:** on each phone/computer that should be notified, open
   `/admin`, tap **Turn on alerts** in the sidebar, allow notifications, then
   **Send test**. New bookings and new user sign-ups then notify that device
   even when the website is closed (Android Chrome and desktop browsers; not
   iPhone Safari).

## Local development

```bash
npm install
npm run dev        # http://localhost:3000 (clears .next first — avoids OneDrive file-lock errors)
npm run build      # production build check
```

In development only, `/admin/login` shows a one-click access button and the
password defaults to `innova2026` if `ADMIN_PASSWORD` is not set. Neither
exists in production builds.
