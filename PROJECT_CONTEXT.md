# PROJECT_CONTEXT.md
> **Single Source of Truth** for Innova Cabs Bangalore web project.  
> Read this file before undertaking any task, feature implementation, or refactor.

---

## 1. Client & Business Overview

- **Business Name**: Innova Cabs Bangalore
- **Tagline**: *"Innova Cabs Bangalore | Innova Crysta and Hycross Rental"*
- **Closing Line**: *"Comfortable Cars. Experienced Drivers. Reliable Journeys."*
- **Operating Hours**: Open 24/7
- **Experience**: 15 years of industry experience
- **Primary Phone**: `+91 9686025999`
  - Tel Link: [`tel:+919686025999`](tel:+919686025999)
  - WhatsApp Link: [`https://wa.me/919686025999`](https://wa.me/919686025999)
- **Admin / Notification Email**: `greensrentacab@gmail.com`
- **Official Address (NAP Consistency)**:
  ```text
  25, 2nd Cross St, Muniyappa Layout, Nagenahalli, Narayanapura, Bengaluru, Karnataka 560077
  ```
  *(Important: Name, phone, and address must match Google Business Profile character-for-character across all pages, Schema.org markup, and footers).*

### Client-Supplied Trust Claims
*(Accuracy confirmed by client; verify against Google Profile before publishing Schema)*:
- **Rating**: 5 Star Google rating
- **Customers**: 5000+ happy customers
- **Experience**: 15 years of reliable service

---

## 2. Services & Destinations

### Service Offerings
1. **Airport Pickup / Drop**: Timely airport transfers to/from Kempegowda International Airport (BLR).
2. **Local Use**: Half-day and full-day local city rentals with experienced chauffeurs.
3. **Outstation Trips**: One-way drops and round-trip rentals for intercity journeys.
4. **Tour Packages**: Tailored, enquiry-based holiday and tour itineraries.
5. **Specialized Travel**: Family vacations, group outings, and corporate corporate travel.

### Local Bangalore Coverage
Bangalore City & Airport, Marathahalli, Whitefield, HSR Layout, Koramangala, Indiranagar, Sarjapur Road, JP Nagar, Bannerghatta Road, KR Puram, MG Road.

### Key Outstation Routes
- Mysore
- Coorg
- Ooty
- Wayanad
- Chikmagalur
- Kodaikanal
- Pondicherry

---

## 3. Fleet & Vehicle Models

- **Models**:
  1. Toyota Innova
  2. Toyota Innova Crysta
  3. Toyota Innova Hycross *(UNCONFIRMED - flag dynamically)*
- **Data Architecture**:
  - Vehicles are **data-driven from Firestore**, never hard-coded.
  - The UI must dynamically support 2 or 3 vehicle models based on database records.

---

## 4. Call to Action (CTA) Lines

- `"Call Now for Instant Booking"`
- `"WhatsApp Us for a Quick Quote"`
- `"Reserve Your Innova in Advance"`

---

## 5. Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with CSS variables / design tokens)
- **Database & Auth**: Firebase (Cloud Firestore & Firebase Auth for Admin)
- **Location Services**: Google Places API (autocomplete & address resolution)
- **Email Notifications**: Resend
- **Hosting & Deployment**: Vercel

---

## 6. Design System & Tokens

All colors must be defined as reusable tokens in Tailwind config / CSS variables for instant theme adjustments:

| Token Name | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Deep Navy** (`primary`) | `#0B1B33` | Primary brand color, headers, hero background, high-contrast text |
| **Off-White** (`background-alt` / `surface`) | `#F7F5F0` | Clean, warm background, card backgrounds |
| **CTA Amber/Orange** (`accent` / `cta`) | `#F0562B` | High-visibility action buttons, call buttons, badges |
| **Typography** | `Inter` (sans-serif) | Clean, highly legible mobile & desktop typography |

### Assets & Placeholders
- **Images**: Use clearly labeled, properly dimensioned SVG/HTML placeholders until client supplies verified photographs.
- **Logo**: Text wordmark placeholder styling matching the deep navy and amber branding.

---

## 7. SEO Strategy & Meta Specifications

- **Page Title**: `Innova Cabs Bangalore | Innova & Innova Crysta Rental`
- **Main Heading (H1)**: `Innova Cabs Bangalore – Innova & Innova Crysta Rental`
- **Primary Keywords**:
  - `Innova Cabs Bangalore`
  - `Innova Rental Bangalore`
  - `Innova Crysta Rental Bangalore`
- **Secondary Keywords**:
  - `Innova Taxi Bangalore`
  - `Innova with Driver Bangalore`
  - `Innova Airport Taxi Bangalore`
- **High-Intent Search Terms**:
  - `Book Innova Cab Bangalore`
  - `Innova Cab Bangalore Price`
  - `Innova Cab Bangalore to Coorg`
- **Structured Data**: LocalBusiness / AutoRental JSON-LD schema with exact NAP.

---

## 8. Core Business & Architecture Rules

1. **Mobile-First Experience**:
   - The majority of traffic originates from paid mobile ads.
   - All interactive elements must strictly adhere to a **minimum 44px touch target**.
   - Sticky mobile bottom CTA bar (Call & WhatsApp).

2. **No Customer Login / Self-Serve Payment**:
   - Customer account creation/login does **not** exist.
   - Submitting a booking creates a **REQUEST** with status `PENDING`.
   - Admin reviews the request and confirms directly with the customer via a pre-filled `wa.me` WhatsApp link or phone call.
   - **No WhatsApp Business API** integration; **No Payment Gateway**.

3. **Pricing Rules**:
   - Pricing is **NOT** final yet.
   - All prices in Firestore are **nullable** and **admin-editable**.
   - If price is `null` or empty, display: `"Price on request"` alongside a direct **WhatsApp Quick Quote** button.
   - **CRITICAL**: Never invent or hallucinate pricing figures anywhere on the site.

4. **Testimonials & Reviews**:
   - Never invent or fabricate reviews or testimonials.
   - The testimonials section must remain **hidden** until genuine, client-provided Google reviews are connected.

5. **NAP Consistency**:
   - Name, Phone, and Address must be identical everywhere (Header, Footer, Contact Page, Schema markup, Google Business Profile alignment).

6. **Page Structure**:
   - The homepage functions as a high-converting, single landing page focused on lead generation via Phone, WhatsApp, and Booking Request Form.
