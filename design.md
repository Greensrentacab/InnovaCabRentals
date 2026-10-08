# Design System Specification & Frontend Blueprint

> **Product:** Innova Cab Rentals — premium chauffeur-driven Toyota Innova & Innova Crysta rentals, Bangalore.
> **Stack the spec is written for:** React 18 + TypeScript, Tailwind CSS 3.4, Framer Motion 11, Lucide React icons.
> **Purpose:** the single source of truth for re-implementing this exact interface in another codebase. Every class string below is copied from the production components. Where a value comes from Tailwind's default theme, its resolved value is given so the design can also be rebuilt without Tailwind.

---

## Table of contents

1. [Visual foundation & design tokens](#1-visual-foundation--design-tokens)
2. [Global layout & structural shell](#2-global-layout--structural-shell)
3. [Atomic UI components & form fields](#3-atomic-ui-components--form-fields)
4. [Animation & interaction specifications](#4-animation--interaction-specifications)
5. [Implementation guide for an existing codebase](#5-implementation-guide-for-an-existing-codebase)

---

## 1. Visual foundation & design tokens

### 1.1 Colour palette

#### Brand & custom tokens (defined in `tailwind.config.js`)

| Token | Hex | RGB | Role |
|---|---|---|---|
| `porcelain` | `#F8FAFC` | 248 250 252 | Page background (`body`) |
| `ink` | `#0F172A` | 15 23 42 | Headings, primary text, dark CTA band, active switcher pill |
| `brand-50` | `#EFF6FF` | 239 246 255 | Icon tiles, eyebrow fill, selected list rows, airport row fill |
| `brand-100` | `#DBEAFE` | 219 234 254 | Airport row border, light text on blue banners |
| `brand-200` | `#BFDBFE` | 191 219 254 | Completed timeline node border, open FAQ border |
| `brand-300` | `#93C5FD` | 147 197 253 | Hover borders on pills/cards, today-ring in calendar |
| `brand-400` | `#60A5FA` | 96 165 250 | Timeline connector gradient end, ambient glow (`/20`) |
| `brand-500` | `#3B82F6` | 59 130 246 | Focus borders, focus rings (`/10`), selection ring |
| **`brand-600`** | **`#2563EB`** | 37 99 235 | **Primary action — "Electric Cobalt"**: primary buttons, selected date, active nodes, icons |
| `brand-700` | `#1D4ED8` | 29 78 216 | Primary hover, prices, active tab label, emphasised text |
| **`brand-800`** | **`#1E40AF`** | 30 64 175 | **"Royal Indigo"**: urgent banner gradient start, text on white buttons over blue |
| `brand-900` | `#1E3A8A` | 30 58 138 | Logo-mark gradient end |
| `live-400` | `#34D399` | 52 211 153 | Live dot on dark hero |
| `live-500` | `#10B981` | 16 185 129 | Live / availability dots, success tints (`/10`, `/15`, `/20`) |
| `live-600` | `#059669` | 5 150 105 | "Included", success text, check icons, 24/7 pill text |
| `whatsapp` | `#25D366` | 37 211 102 | WhatsApp buttons only (fill; `/15` tint on dock icon) |
| — | `#128C4A` | 18 140 74 | WhatsApp icon colour on its `/15` tint (dock) |

#### Tailwind default colours used (resolved values)

| Class family | Shades used → hex |
|---|---|
| **slate** (neutrals) | 50 `#F8FAFC` · 100 `#F1F5F9` · 200 `#E2E8F0` · 300 `#CBD5E1` · 400 `#94A3B8` · 500 `#64748B` · 600 `#475569` · 700 `#334155` · 800 `#1E293B` · 900 `#0F172A` · 950 `#020617` |
| **amber** (rating, badges) | 50 `#FFFBEB` · 100 `#FEF3C7` · 200 `#FDE68A` · 400 `#FBBF24` · 500 `#F59E0B` · 600 `#D97706` · 800 `#92400E` · 950 `#451A03` |
| **rose** (errors) | 50 `#FFF1F2` · 300 `#FDA4AF` · 400 `#FB7185` · 500 `#F43F5E` · 600 `#E11D48` · 700 `#BE123C` |
| **indigo** (accents) | 50 `#EEF2FF` · 100 `#E0E7FF` · 600 `#4F46E5` · 700 `#4338CA` · 800 `#3730A3` |
| **sky** (status) | 100 `#E0F2FE` · 800 `#075985` |
| white / black | `#FFFFFF` (cards, inputs on focus) |

#### Semantic role map

| Role | Value |
|---|---|
| Page background | `bg-porcelain` `#F8FAFC` |
| Alternate section background | `bg-white` `#FFFFFF` (e.g. "How booking works") |
| Card / surface fill | `bg-white` + `border-slate-200/80` (`rgba(226,232,240,0.8)`) |
| Frosted surface | `bg-white/70` (glass) · `bg-white/85` (glass-strong) |
| Input fill (rest → focus) | `bg-slate-50/70` → `bg-white` |
| Hero background | `bg-slate-950` `#020617` under a photo + gradients |
| Heading text | `text-ink` `#0F172A` |
| Body text | `text-slate-600` `#475569` |
| Secondary / helper text | `text-slate-500` `#64748B` |
| Muted / fine print | `text-slate-400` `#94A3B8` |
| Text on dark | `text-white`, body `text-slate-200` `#E2E8F0`, labels `text-slate-300` `#CBD5E1` |
| Hairline border | `border-slate-200/80` · dividers `border-slate-100` `#F1F5F9` |
| Hover border | `border-slate-300` / `border-slate-300/80` / `border-brand-300` |
| Focus | border `brand-500` + ring `brand-500/10` (4px) · keyboard ring `ring-2 ring-brand-500 ring-offset-2` |
| Primary action | `bg-brand-600` → hover `bg-brand-700` |
| Success / live | `live-500` dot, `live-600` text, `live-500/10` tint |
| Rating star | `fill-amber-400 text-amber-400` `#FBBF24` |
| "Most Booked" badge | `bg-amber-400 text-amber-950` |
| Error | `text-rose-600` `#E11D48`, field `border-rose-300 bg-rose-50/50` |
| WhatsApp | `bg-whatsapp` `#25D366` |
| Text selection | `bg-brand-600 text-white` |

#### Status chips (booking pipeline)

| Status | Classes |
|---|---|
| Pending | `bg-amber-100 text-amber-800` |
| Confirmed | `bg-brand-100 text-brand-800` |
| Driver assigned | `bg-indigo-100 text-indigo-800` |
| On trip | `bg-sky-100 text-sky-800` |
| Completed | `bg-live-500/15 text-live-600` |
| Cancelled | `bg-rose-100 text-rose-700` |

### 1.2 Tailwind configuration (copy verbatim)

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        porcelain: '#F8FAFC',
        ink: '#0F172A',
        brand: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB', // Electric Cobalt — primary
          700: '#1D4ED8',
          800: '#1E40AF', // Royal Indigo
          900: '#1E3A8A',
        },
        live: {
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
        },
        whatsapp: '#25D366',
      },
      boxShadow: {
        float: '0 18px 40px -14px rgba(15, 23, 42, 0.16), 0 2px 6px -2px rgba(15, 23, 42, 0.06)',
        'float-lg': '0 32px 70px -20px rgba(15, 23, 42, 0.28), 0 4px 12px -4px rgba(15, 23, 42, 0.08)',
        glow: '0 12px 30px -8px rgba(37, 99, 235, 0.55)',
        'glow-live': '0 0 0 4px rgba(16, 185, 129, 0.18)',
        'inner-hair': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.7)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      backgroundImage: {
        'grid-slate':
          'linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)',
        'dawn-sky': 'linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 45%, #FEF3C7 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '80%, 100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
        float: 'float 5s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
```

### 1.3 Typography

**Primary family:** Plus Jakarta Sans (Google Fonts), weights **400, 500, 600, 700, 800**, `display=swap`.
**Fallback stack:** `"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif`.
**Display / serif / monospace:** none. The whole system is one sans family; hierarchy comes from weight (800 for display) and tight tracking. Numerals in tables use `tabular-nums`.
**Body features:** `font-feature-settings: 'ss01', 'cv11'`, `antialiased`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

#### Type scale matrix

Tailwind size reference: `text-[10px]` 10px · `text-[11px]` 11px · `text-xs` 12px/16px · `text-[13px]` 13px · `text-sm` 14px/20px · `text-[15px]` 15px · `text-base` 16px/24px · `text-lg` 18px/28px · `text-xl` 20px/28px · `text-2xl` 24px/32px · `text-3xl` 30px/36px · `text-4xl` 36px/40px · `text-5xl` 48px/1. Tracking: `tracking-tight` −0.025em · `tracking-wide` 0.025em · `leading-relaxed` 1.625.

| Element | Mobile → desktop size | Line-height | Tracking | Weight | Classes |
|---|---|---|---|---|---|
| **H1 – home hero** (on dark) | 37.6px → 48px (`sm`) → 56px (`lg`) | 1.05 | −0.025em | 800 | `text-balance mt-6 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]` + `text-white` (from parent) |
| **H1 – inner pages** | 35.2px → 48px | 1.06 | −0.025em | 800 | `text-balance mt-5 text-[2.2rem] font-extrabold leading-[1.06] tracking-tight text-ink sm:text-5xl` |
| **H1 – confirmation / lookup** | 30px → 36px | 36→40px | −0.025em | 800 | `text-3xl font-extrabold tracking-tight sm:text-4xl` |
| **H2 – section** | 30px → 36px | 36→40px | −0.025em | 800 | `text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl` |
| **H2 – CTA band** | 24px → 30px | 32→36px | −0.025em | 800 | `text-balance text-2xl font-extrabold tracking-tight sm:text-3xl` |
| **H2 – widget / drawer title** | 18px | 28px | −0.025em | 800 | `text-lg font-extrabold tracking-tight text-ink` |
| **H3 – card title** | 18–24px | — | −0.025em | 800 | `text-lg font-extrabold` · service card `text-xl font-extrabold tracking-tight` · fleet `text-2xl font-extrabold tracking-tight` |
| **Body – hero lead** | 16px → 18px | 1.625 | — | 400 | `mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg` (dark) · `text-slate-600` (light) |
| **Body – section subtitle** | 16px | 24px | — | 400 | `mt-3 text-slate-600` |
| **Body – card** | 14px | 20px | — | 400–500 | `text-sm text-slate-600` · list item `text-sm font-medium text-slate-700` |
| **Overline / eyebrow** | 12px | 16px | 0.12em | 700 | `.eyebrow` → `text-xs font-bold uppercase tracking-[0.12em] text-brand-700` |
| **Field label** | 11px | — | 0.08em | 700 | `.label` → `mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500` |
| **Micro label (stat / column)** | 10px | — | 0.025em | 700 | `text-[10px] font-bold uppercase tracking-wide text-slate-400` |
| **Group label (menus/footer)** | 11–12px | — | 0.12em | 700 | `text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400` / `text-xs … text-slate-500` |
| **Button** | 14px (`text-sm`); CTA 15px | 20px | — | 600 | `.btn` → `text-sm font-semibold`; widget CTA adds `text-[15px]` |
| **Input value** | 14px | 20px | — | 500 | `.field` → `text-sm font-medium text-ink placeholder:text-slate-400` |
| **Price – hero** | 36px | 40px | −0.025em | 800 | `text-4xl font-extrabold tracking-tight` |
| **Price – card** | 14–20px | — | — | 800 | `text-sm`/`text-lg`/`text-xl font-extrabold` + `tabular-nums` in tables |
| **Brand wordmark** | 15px | 1 | −0.025em | 800 | `block text-[15px] font-extrabold tracking-tight text-ink` |
| **Brand sub-line** | 10px | — | 0.14em | 700 | `text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700` |
| **Fine print / credit** | 10–11px | snug/relaxed | — | 400–600 | `text-[10px] leading-snug` · `text-[11px] leading-relaxed text-slate-500` |

### 1.4 Elevation, borders & geometry

#### Radius scale

| Token | Value | Used for |
|---|---|---|
| `rounded-full` | 9999px | Pills, chips, all buttons, segmented controls, header bar, avatars/dots |
| `rounded-[28px]` / `rounded-[22px]` | 28px / 22px | Mobile dock shell / its CTA |
| `rounded-4xl` *(custom)* | 2rem = 32px | Booking widget, CTA bands, urgent banner, drawers, mobile menu sheet, photo cards |
| `rounded-3xl` | 24px | Content cards (`.card-float`), dropdown menus, calendar pop-up, search bar, fare option cards |
| `rounded-2xl` | 16px | **Inputs (`.field`)**, list rows, small cards, route cards, FAQ items, local-package radio cards, stat tiles |
| `rounded-xl` | 12px | Service tabs, icon tiles (40px), logo mark, calendar day cells, autocomplete rows |
| `rounded-lg` | 8px | Autocomplete icon tiles (32px) |

> Note: in this system inputs are `rounded-2xl` (16px) and service tabs `rounded-xl` (12px).

#### Borders

| Use | Definition |
|---|---|
| Hairline (default) | `border border-slate-200/80` → 1px `rgba(226,232,240,0.8)` |
| Divider | `border-t border-slate-100` |
| Glass edge | `border border-white/60` (light glass) · `border-white/10` (dark glass) · `border-white/15–20` (pills on dark hero) |
| Hover | `hover:border-slate-300/80` (cards) · `hover:border-slate-300` (ghost button) · `hover:border-brand-300` (pills, options) |
| Active / selected | `border-brand-500` + `ring-4 ring-brand-500/10` · fleet card `border-brand-300 ring-4 ring-brand-500/10` |
| Timeline node | `border-2` (`slate-200` idle → `brand-200` done → `brand-600` active) |
| Dashed route connector | `border-l-2 border-dashed border-slate-300` |
| Error | `border-rose-300` (focus `border-rose-400`, ring `rose-500/10`) |
| Transition | borders animate via `transition-colors duration-200` (fields) or `transition-all duration-300 ease-premium` (cards) |

#### Shadows & glows (exact CSS)

| Token | CSS `box-shadow` | Used for |
|---|---|---|
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | Pills, header at rest |
| `shadow-float` | `0 18px 40px -14px rgba(15,23,42,0.16), 0 2px 6px -2px rgba(15,23,42,0.06)` | Resting cards, active tab chip, glass-strong |
| `shadow-float-lg` | `0 32px 70px -20px rgba(15,23,42,0.28), 0 4px 12px -4px rgba(15,23,42,0.08)` | Hover cards, widgets, overlays, pop-ups, dock |
| `shadow-glow` | `0 12px 30px -8px rgba(37,99,235,0.55)` | Primary buttons, logo mark, selected date, active timeline node |
| `shadow-glow-live` | `0 0 0 4px rgba(16,185,129,0.18)` | Success check halo |
| `shadow-inner-hair` | `inset 0 1px 0 0 rgba(255,255,255,0.7)` | Optional glass highlight |

#### Frosted glass recipes

| Class | Recipe |
|---|---|
| `.glass` | `border border-white/60 bg-white/70 backdrop-blur-md backdrop-saturate-150` |
| `.glass-strong` | `border border-slate-200/80 bg-white/85 shadow-float backdrop-blur-xl backdrop-saturate-150` |
| `.glass-dark` | `border border-white/10 bg-slate-900/60 text-white backdrop-blur-md` |

#### Decorative backgrounds & gradients

| Name | Definition |
|---|---|
| Grid texture | `bg-grid-slate [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,#000_30%,transparent_70%)]` (32px variant on banners at `opacity-20`) |
| Ambient blue glow | `absolute -top-40 left-1/2 h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-brand-400/20 blur-[120px]` |
| Hero photo scrim (horizontal) | mobile `bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/30` · `lg` `from-slate-950/95 via-slate-950/70 to-slate-950/25` |
| Hero photo scrim (vertical) | mobile `bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950` · `lg` `via-transparent to-slate-950/70` |
| Image caption fade | `bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent` (service) · `from-slate-950/60 to-transparent` (photo card) |
| Urgent banner | `bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-700` |
| Hero headline accent (optional) | `bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-600 bg-clip-text text-transparent` |
| Timeline connector fill | `bg-gradient-to-r from-brand-600 to-brand-400` |
| Section top hairline | `h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent` |
| Logo mark | `bg-gradient-to-br from-brand-600 to-brand-900` |

#### Z-index scale

| Layer | z |
|---|---|
| Hero section (so its calendar pop-up overlays the next section) | `z-10` |
| Autocomplete list | `z-30` |
| Calendar pop-up | `z-40` |
| Mobile dock | `z-40` |
| Dev "gated" badge | `z-[45]` |
| Header, mobile menu sheet & backdrop | `z-50` |
| Modals / drawers | `z-[60]` |

---

## 2. Global layout & structural shell

### 2.1 Breakpoints (Tailwind defaults)

| Prefix | Min width | Key behaviour |
|---|---|---|
| — | 0 | Single column, mobile dock, hamburger menu |
| `sm` | 640px | Larger gutters (24px), header "Book a Cab" visible, inline button rows |
| `md` | 768px | 2–4 column card grids, horizontal timeline, 24/7 call pill, slider arrows, drawer becomes side panel |
| `lg` | 1024px | Desktop nav + dropdowns, 2-column hero, dock hidden |
| `xl` | 1280px | "Rates from" pill in header, 4-up route slider widths |

Designs are verified at **375px** and **1366–1440px**. There must be no horizontal page scroll at any width.

### 2.2 Containers & spacing

```css
.section { @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8; }
/* max-w-7xl = 80rem = 1280px; gutters 16px → 24px → 32px */
```

| Pattern | Classes |
|---|---|
| Standard section | `section py-16 sm:py-20` (64px → 80px) |
| Tall section (timeline) | `py-16 sm:py-24` (64px → 96px) |
| Section heading block | `mx-auto max-w-2xl text-center` (centered) or `max-w-2xl` (left) |
| Heading → content gap | `mt-10` / `mt-12` (grid), `mt-14` (timeline), `mt-6` (slider) |
| Card grid gaps | `gap-5` (cards), `gap-3` (route grid), `gap-4` (slider) |
| Inner page hero | `relative overflow-hidden pb-12 pt-28 sm:pt-32` |
| Home hero | `relative isolate z-10 bg-slate-950 pb-14 pt-28 sm:pt-32 lg:min-h-[680px] lg:pb-20` |
| Footer | `bg-ink pb-28 pt-14 text-slate-300 lg:pb-14` (bottom padding clears the mobile dock) |
| CTA band wrapper | `section pb-20` |

### 2.3 Grid recipes

| Layout | Classes |
|---|---|
| Home hero | `section grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]` |
| Inner hero with aside | `section grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-10` |
| Service cards | `mt-12 grid gap-5 md:grid-cols-3` |
| Fleet cards | `grid gap-5 md:grid-cols-2` |
| Route grid | `grid gap-3 sm:grid-cols-2 lg:grid-cols-4` (or `lg:grid-cols-3`) |
| Timeline | `relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6` |
| Testimonials block | `grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center` |
| FAQ page | `grid gap-10 lg:grid-cols-[0.8fr_1.2fr]` |
| Footer | `section grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]` |

> **Rule:** always wrap fractional columns in `minmax(0, …)` so wide children (scrolling strips, long words) can't squeeze the other column.

### 2.4 Fixed & floating shell

```
┌───────────────────── fixed header (z-50, floating pill, top-3) ─────────────────────┐
│ [logo] [Airport▾][Outstation▾][Fleet▾][More▾]        [Rates][24/7 call][Book a Cab]│
└──────────────────────────────────────────────────────────────────────────────────────┘
  <main> … sections … </main>
  <footer>
┌──── mobile dock (< lg, z-40, appears after 240px scroll, safe-area padded) ────┐
│ (Call) (WhatsApp) (Rates)            [ Book Now ███████████████ ]              │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Header wrapper | `fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4` |
| Header bar | `mx-auto flex max-w-7xl items-center gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 ease-premium sm:pl-4` + `glass shadow-sm` at rest → `glass-strong` once `scrollY > 8` |
| Content offset | first section uses `pt-28 sm:pt-32` (112px / 128px) to clear the header |
| Anchor offset | `scroll-mt-24`/`scroll-mt-28`, and JS scroll offset −88px |
| Mobile dock | `pb-safe fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden` (see §3.5) |
| Body scroll lock | while the mobile menu or an overlay is open, `document.body.style.overflow = 'hidden'` |

---

## 3. Atomic UI components & form fields

### 3.0 Shared component classes (`globals.css` → `@layer components`)

```css
@layer components {
  /* Glass */
  .glass        { @apply border border-white/60 bg-white/70 backdrop-blur-md backdrop-saturate-150; }
  .glass-strong { @apply border border-slate-200/80 bg-white/85 shadow-float backdrop-blur-xl backdrop-saturate-150; }
  .glass-dark   { @apply border border-white/10 bg-slate-900/60 text-white backdrop-blur-md; }

  /* Cards & chips */
  .card-float       { @apply rounded-3xl border border-slate-200/80 bg-white shadow-float transition-all duration-300 ease-premium; }
  .card-float-hover { @apply hover:-translate-y-1 hover:border-slate-300/80 hover:shadow-float-lg; }
  .pill      { @apply inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm; }
  .chip-live { @apply inline-flex items-center gap-1.5 rounded-full bg-live-500/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-live-600; }

  /* Buttons */
  .btn          { @apply inline-flex select-none items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ease-premium active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50; }
  .btn-primary  { @apply btn bg-brand-600 text-white shadow-glow hover:-translate-y-0.5 hover:bg-brand-700; }
  .btn-ghost    { @apply btn border border-slate-200/80 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-float; }
  .btn-whatsapp { @apply btn bg-whatsapp text-white hover:-translate-y-0.5 hover:brightness-95; }

  /* Fields */
  .field       { @apply w-full rounded-2xl border border-slate-200/80 bg-slate-50/70 px-4 py-3 text-sm font-medium text-ink placeholder:text-slate-400 transition-colors duration-200 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-500/10; }
  .field-error { @apply border-rose-300 bg-rose-50/50 focus:border-rose-400 focus:ring-rose-500/10; }
  .label       { @apply mb-1.5 block text-[11px] font-bold uppercase tracking-[0.08em] text-slate-500; }

  /* Skeleton */
  .shimmer { @apply relative overflow-hidden bg-slate-200/60; }
  .shimmer::after { content: ''; @apply absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/70 to-transparent; }

  /* Layout */
  .section { @apply mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8; }
  .eyebrow { @apply inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-brand-700; }
}
```

#### Button matrix

| Variant | Base | Hover | Active | Disabled |
|---|---|---|---|---|
| Primary | blue `#2563EB`, white text, `shadow-glow`, h≈44px (`py-3`) | `bg-brand-700`, lifts `-translate-y-0.5` (2px) | `scale-[0.97]` | `opacity-50`, no pointer events |
| Ghost | white, `border-slate-200/80`, `text-slate-800` | border `slate-300`, `shadow-float`, lift 2px | `scale-[0.97]` | same |
| WhatsApp | `#25D366`, white text | `brightness-95`, lift 2px | `scale-[0.97]` | same |
| White-on-blue | `btn bg-white text-brand-800 shadow-float hover:-translate-y-0.5` | lift | `scale-[0.97]` | — |
| White-on-dark | `btn bg-white text-ink hover:-translate-y-0.5` | lift | — | — |
| Translucent-on-dark | `btn border border-white/20 bg-white/10 text-white hover:bg-white/15` | `bg-white/15` | — | — |

Sizes: default `px-5 py-3 text-sm`; header compact `px-5 py-2.5`; wide CTA `w-full py-3.5 text-[15px]`; small in-card `px-4 py-2.5` / `px-3`. Icons inside buttons are `h-4 w-4`, and arrow icons nudge right on group hover (`transition-transform group-hover:translate-x-1`).

#### Pills & chips on dark (hero)

```html
<!-- Live status chip -->
<span class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold backdrop-blur-md">
  <span class="relative flex h-2 w-2">
    <span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-400"></span>
    <span class="relative inline-flex h-2 w-2 rounded-full bg-live-400"></span>
  </span>
  Booking open now · 24 hours
</span>

<!-- Service quick-link pill -->
<a class="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20">
  <!-- icon h-4 w-4 --> Airport
</a>
```

---

### 3.1 Header / navbar

**Layout:** a floating rounded-full glass bar inside `max-w-7xl`, laid out as: brand (left) · desktop nav (`ml-4`, `lg+`) · utilities (`ml-auto`).

```html
<header class="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
  <div class="mx-auto flex max-w-7xl items-center gap-3 rounded-full py-2 pl-3 pr-2 transition-all duration-300 ease-premium sm:pl-4 glass shadow-sm">
    <!-- scrolled: replace "glass shadow-sm" with "glass-strong" -->

    <!-- Brand -->
    <a class="flex items-center gap-2.5">
      <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-glow">
        <!-- Car icon h-5 w-5, strokeWidth 2.2 -->
      </span>
      <span class="leading-none">
        <span class="block text-[15px] font-extrabold tracking-tight text-ink">Innova Cab Rentals</span>
        <span class="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
          <!-- Crown h-2.5 w-2.5 --> Premium · Bangalore
        </span>
      </span>
    </a>

    <!-- Desktop nav (lg+) -->
    <nav class="ml-4 hidden items-center gap-0.5 lg:flex">
      <div class="relative">
        <button class="flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold transition-colors text-slate-600 hover:text-ink">
          Airport <!-- ChevronDown h-3.5 w-3.5 transition-transform; open: rotate-180 -->
        </button>
        <!-- open trigger state: "bg-slate-100 text-ink" -->
      </div>
    </nav>

    <!-- Utilities -->
    <div class="ml-auto flex items-center gap-2">
      <button class="hidden items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:border-brand-300 hover:text-brand-700 xl:flex">
        Rates from <span class="font-extrabold text-ink">₹1,499</span>
      </button>
      <a class="hidden items-center gap-2 rounded-full border border-live-500/20 bg-live-500/10 px-3.5 py-2 text-xs font-bold text-live-600 transition hover:bg-live-500/15 md:flex">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-live-500"></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-live-500"></span>
        </span>
        <!-- Headphones h-3.5 w-3.5 --> 24/7 · +91 98765 43210
      </a>
      <button class="btn-primary hidden px-5 py-2.5 sm:inline-flex">Book a Cab</button>
      <button class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-ink lg:hidden" aria-label="Open menu"><!-- Menu h-5 w-5 --></button>
    </div>
  </div>
</header>
```

**Dropdown panel** (hover-intent: opens on `mouseenter`, closes 140ms after `mouseleave`):

```html
<div class="glass-strong absolute left-0 top-[calc(100%+10px)] w-80 rounded-3xl p-2">
  <button class="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors hover:bg-slate-50">
    <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
      <!-- icon h-[18px] w-[18px] -->
    </span>
    <span class="min-w-0 flex-1">
      <span class="block text-sm font-bold text-ink">Airport Pickup</span>
      <span class="block text-xs text-slate-500">BLR arrivals → your doorstep</span>
    </span>
    <!-- ArrowRight: h-4 w-4 -translate-x-1 text-slate-300 opacity-0 transition
         group-hover:translate-x-0 group-hover:text-brand-600 group-hover:opacity-100 -->
  </button>
</div>
```

Motion: `initial {opacity:0, y:8, scale:0.98}` → `animate {opacity:1, y:0, scale:1}` → `exit {opacity:0, y:6, scale:0.98}`, `duration 0.18`, ease `[0.22,1,0.36,1]`.

**Mobile menu sheet** (`< lg`):
- Backdrop: `fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-sm lg:hidden` (fades).
- Sheet: `glass-strong fixed inset-x-3 top-3 z-50 max-h-[calc(100dvh-24px)] overflow-y-auto rounded-4xl p-4 lg:hidden`. It drops in (`y −12 → 0`, `scale 0.98 → 1`, `0.22s`).
- Group: `border-t border-slate-100 py-2`. Group label `px-2 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400`.
- Row: `flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-slate-50`, with icon `h-4 w-4 text-brand-600`, label `text-sm font-semibold`, and hint `ml-auto text-xs text-slate-400`.
- Footer: `mt-2 grid grid-cols-2 gap-2` holding `btn-ghost` "Call 24/7" and `btn-primary` "Book a Cab".
- Close button: `flex h-9 w-9 items-center justify-center rounded-full bg-slate-100` with an X icon `h-4 w-4`.

---

### 3.2 Hero + interactive booking widget

#### 3.2.1 Hero (photo backdrop)

```html
<section class="relative isolate z-10 bg-slate-950 pb-14 pt-28 sm:pt-32 lg:min-h-[680px] lg:pb-20">
  <img src="/images/hero.webp" srcset="/images/hero-960.webp 960w, /images/hero.webp 1920w" sizes="100vw"
       fetchpriority="high" decoding="async" alt="…"
       class="absolute inset-x-0 top-0 -z-20 h-[560px] w-full object-cover object-[70%_center] lg:inset-0 lg:h-full lg:object-[68%_center]" />
  <div class="absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/30 lg:inset-0 lg:h-full lg:from-slate-950/95 lg:via-slate-950/70 lg:to-slate-950/25"></div>
  <div class="absolute inset-x-0 top-0 -z-10 h-[560px] bg-gradient-to-b from-slate-950/40 via-slate-950/20 to-slate-950 lg:inset-0 lg:h-full lg:via-transparent lg:to-slate-950/70"></div>

  <div class="section grid items-start gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
    <div class="pt-2 text-white lg:pt-10">
      <!-- live chip (§3.0) -->
      <h1 class="text-balance mt-6 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">Airport, Outstation & Local Innova Rentals in Bangalore</h1>
      <p class="mt-5 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">…</p>
      <ul class="mt-7 flex flex-wrap gap-2"><!-- service pills on dark --></ul>
      <p class="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">Airport transfers from</span>
        <span class="text-4xl font-extrabold tracking-tight">₹1,499</span>
        <span class="text-sm text-slate-300">fixed, not metered</span>
      </p>
      <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-200">
        <li class="flex items-center gap-1.5"><!-- Star h-4 w-4 fill-amber-400 text-amber-400 --> 5-Star Rated · 5000+ customers</li>
        <li class="flex items-center gap-1.5"><!-- ShieldCheck h-4 w-4 --> Verified chauffeurs</li>
        <li class="flex items-center gap-1.5"><!-- Radar h-4 w-4 --> Flight tracked</li>
      </ul>
    </div>
    <div class="min-w-0"><!-- Booking widget --></div>
  </div>
  <p class="absolute bottom-2 right-3 text-[10px] leading-snug text-white/45 transition-colors hover:text-white/80">Photo: … / Wikimedia Commons, CC BY-SA 4.0</p>
</section>
```

Rules:
- **Mobile:** the photo is pinned to the top 560px and fades into `slate-950` underneath, so the tall stacked layout never over-zooms the image.
- **Desktop:** the photo is full-bleed with focal point `68% center`, so the car shows between the copy and the card.
- **No overflow clipping:** the section must not use `overflow-hidden`, because the widget's calendar pop-up extends past the hero. `z-10` keeps that pop-up above the next section.

#### 3.2.2 Widget shell

```html
<form id="book" class="glass-strong relative scroll-mt-28 rounded-4xl p-4 shadow-float-lg sm:p-6">
  <div class="mb-4 flex items-center justify-between">
    <div>
      <h2 class="text-lg font-extrabold tracking-tight text-ink">Quick Fare Estimate</h2>
      <p class="text-xs font-medium text-slate-500">Instant fare · ₹0 advance · Free cancellation</p>
    </div>
    <span class="chip-live"><span class="h-1.5 w-1.5 rounded-full bg-live-500"></span> Live</span>
  </div>
  <!-- service tabs → service panel → date → time → CTA → footer line -->
</form>
```

Entrance motion: `{opacity:0, y:24}` → `{opacity:1, y:0}`, duration 0.6, delay 0.15, ease `[0.22,1,0.36,1]`.

#### 3.2.3 Multi-segment service tabs (3-up)

```html
<div role="tablist" class="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-100/80 p-1">
  <button role="tab" aria-selected="true"
    class="relative flex flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-xs font-bold transition-colors sm:flex-row sm:justify-center sm:text-[13px] text-brand-700">
    <!-- active indicator (shared layout): -->
    <span class="absolute inset-0 rounded-xl bg-white shadow-float ring-1 ring-slate-200/80"></span>
    <!-- icon --> <svg class="relative h-4 w-4"></svg>
    <span class="relative">Airport Taxi</span>
  </button>
  <!-- inactive tab text: "text-slate-500 hover:text-slate-800" -->
</div>
```

- The icon stacks above the label on mobile and sits beside it from `sm`.
- The white indicator slides between tabs (Framer `layoutId="service-tab"`, spring stiffness 420, damping 34).
- Switching tabs swaps the panel below with `AnimatePresence mode="wait"`: x `+16 → 0 → −16`, opacity, 0.22s.

#### 3.2.4 Segmented pill control (trip type, terminal)

```html
<div role="radiogroup" class="flex gap-1 rounded-full border border-slate-200/80 bg-slate-100/70 p-1">
  <button role="radio" aria-checked="true"
    class="relative flex-1 whitespace-nowrap rounded-full font-semibold transition-colors px-3 py-2 text-[13px] text-ink">
    <span class="absolute inset-0 rounded-full bg-white shadow-float ring-1 ring-slate-200/80"></span>
    <span class="relative flex items-center justify-center gap-1.5"><!-- icon h-3.5 w-3.5 --> Pickup</span>
  </button>
  <!-- inactive: "text-slate-500 hover:text-slate-800" · small size: "px-3 py-1.5 text-xs" -->
</div>
```

Indicator spring: stiffness 500, damping 38, one `layoutId` per group. Options:
- **Airport:** Pickup / Drop / Round, with icons PlaneLanding, PlaneTakeoff and Repeat.
- **Outstation:** Round Trip / One Way.
- **Terminal:** T1 / T2, using the small size.

#### 3.2.5 Radio card selectors (local packages)

```html
<div role="radiogroup" class="grid grid-cols-3 gap-2">
  <button role="radio" aria-checked="true"
    class="rounded-2xl border px-2 py-2.5 text-left transition-all border-brand-500 bg-brand-50 ring-4 ring-brand-500/10">
    <span class="block text-[13px] font-extrabold text-ink">Full-day</span>
    <span class="block text-[11px] font-semibold text-slate-500">8 hr · 80 km</span>
    <span class="mt-1 block text-[11px] font-bold text-brand-700">₹3,299</span>
  </button>
  <!-- unselected: "border-slate-200/80 bg-white hover:border-brand-300" -->
</div>
```

The selected state is shown by the border, fill and outer ring; this build has no check-badge corner icon. To add one, place `absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white` containing a `Check h-3 w-3` icon on the selected card, and add `relative` to the card.

#### 3.2.6 Airport fixed row

```html
<div class="flex items-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 px-3 py-2.5">
  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white"><!-- Plane h-3.5 w-3.5 --></span>
  <div class="min-w-0 flex-1">
    <p class="truncate text-sm font-semibold text-ink">Kempegowda Intl. Airport (BLR)</p>
    <p class="text-[11px] font-medium text-slate-500">Terminal 1 · Domestic</p>
  </div>
  <!-- T1/T2 segmented (small) -->
</div>
```

Swap button (between the airport row and the address field):
`absolute -right-2.5 top-1/2 z-10 -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 shadow-sm transition duration-300 hover:rotate-180 hover:text-brand-700`, with an `ArrowUpDown h-3.5 w-3.5` icon.

#### 3.2.7 Location input with map-pin icon + autocomplete

```html
<div class="relative">
  <div class="relative">
    <span class="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-brand-50 text-brand-700">
      <!-- pickup: Navigation h-3.5 w-3.5 strokeWidth 2.5 -->
    </span>
    <!-- drop variant icon wrap: "bg-live-500/10 text-live-600" with MapPin -->
    <input role="combobox" class="field pl-12" placeholder="Pickup area in Bangalore" />
    <!-- error: add "field-error" -->
  </div>
  <ul role="listbox" class="glass-strong absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-72 overflow-auto rounded-2xl p-1.5">
    <li role="option" class="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors bg-brand-50">
      <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600"><!-- icon h-4 w-4 --></span>
      <span class="min-w-0">
        <span class="block truncate text-sm font-semibold text-ink">Koramangala</span>
        <span class="block truncate text-xs text-slate-500">South-East Bangalore</span>
      </span>
    </li>
    <!-- non-active rows: "hover:bg-slate-50" -->
  </ul>
  <p class="mt-1.5 pl-1 text-xs font-medium text-rose-600">Enter a pickup area or address</p>
</div>
```

- The list shows at most 6 matches and animates `{opacity 0, y −4, scale .98}` over 0.15s.
- Keyboard: ↑/↓ move the active row, Enter selects, Esc closes. The list closes 120ms after blur, so mouse selection still registers.
- Kind icons: Plane (airport), MapPin (locality), TrainFront (transit), Mountain (city), Building2 (tech park).
- **Outstation pickup-to-destination connector:** `pointer-events-none absolute left-[25px] top-[42px] h-[calc(100%-84px)] border-l-2 border-dashed border-slate-300`.
- **Quick-pick chips:** in a `no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1` row, each chip is `pill shrink-0 transition hover:border-brand-300 hover:text-brand-700`, and the selected one adds `border-brand-300 bg-brand-50 text-brand-700`. The distance suffix is `text-slate-400`.

#### 3.2.8 Date picker — pop-up calendar

> This replaces the earlier horizontal date strip. Past dates are disabled. Today is selectable only while a pickup slot at least 60 minutes ahead remains. The window runs up to 180 days ahead.

**Trigger (looks like a field):**

```html
<label class="label">Travel date</label>
<button aria-haspopup="dialog" aria-expanded="false" class="field flex items-center gap-3 text-left">
  <!-- open: add "border-brand-500 bg-white ring-4 ring-brand-500/10" -->
  <!-- CalendarDays h-4 w-4 shrink-0 text-brand-600 -->
  <span class="flex-1 truncate">Sat, 3 Oct, 2026</span>
  <span class="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">Tomorrow</span>
  <!-- ChevronDown h-4 w-4 shrink-0 text-slate-400 transition-transform; open: rotate-180 -->
</button>
```

**Pop-up:**

```html
<div role="dialog" class="glass-strong absolute left-0 top-[calc(100%+8px)] z-40 w-full min-w-[288px] max-w-[340px] rounded-3xl p-4 shadow-float-lg">
  <!-- header -->
  <div class="flex items-center justify-between">
    <button class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"><!-- ChevronLeft h-4 w-4 --></button>
    <p class="text-sm font-extrabold">October 2026</p>
    <button class="flex h-8 w-8 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 disabled:opacity-30"><!-- ChevronRight h-4 w-4 --></button>
  </div>
  <!-- weekday row (Sun-first) -->
  <div class="mt-3 grid grid-cols-7 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400"><span class="py-1">Sun</span>…</div>
  <!-- 6×7 day grid -->
  <div role="grid" class="grid grid-cols-7 gap-0.5">
    <button role="gridcell" class="relative flex aspect-square items-center justify-center rounded-xl text-sm font-semibold transition-colors text-ink hover:bg-brand-50">4</button>
  </div>
  <!-- footer -->
  <div class="mt-3 flex gap-2 border-t border-slate-100 pt-3">
    <button class="pill disabled:opacity-40">Today</button>
    <button class="pill disabled:opacity-40">Tomorrow</button>
    <span class="ml-auto self-center text-[10px] text-slate-400">Past dates unavailable</span>
  </div>
</div>
```

| Day-cell state | Classes added to the base |
|---|---|
| Selectable | `text-ink hover:bg-brand-50` |
| Disabled / past | `cursor-not-allowed text-slate-300 line-through decoration-slate-300` (+ `disabled`) |
| Outside current month | `opacity-40` |
| Selected | `bg-brand-600 text-white shadow-glow hover:bg-brand-600` |
| Today (not selected) | `ring-1 ring-inset ring-brand-300` |

- Motion: `{opacity 0, y −6, scale .98}`, 0.16s.
- It closes on outside pointer-down or Esc (returning focus to the trigger) and on selection.
- Keyboard: a roving tab index; arrow keys move one day or one week, clamped to the bookable window.
- Previous/Next are disabled outside that window.

#### 3.2.9 Time picker (native select)

```html
<label for="pickup-time" class="label">Pickup time</label>
<div class="relative">
  <!-- Clock: pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 -->
  <select id="pickup-time" class="field appearance-none pl-11 pr-10">…30-min slots, 12-h labels…</select>
  <span class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
</div>
```

The time defaults to 09:00, or the first available slot. Today's list hides slots less than 60 minutes away.

#### 3.2.10 CTA + footer line

```html
<button type="submit" class="btn-primary group mt-5 w-full py-3.5 text-[15px]">
  See Fares & Available Innovas
  <!-- ArrowRight h-4 w-4 transition-transform group-hover:translate-x-1 -->
</button>
<div class="mt-3 flex items-center justify-between gap-2 text-xs">
  <span class="flex items-center gap-1.5 font-medium text-slate-500"><!-- ShieldCheck h-3.5 w-3.5 text-live-600 --> No surge. No hidden charges.</span>
  <span class="font-semibold text-slate-600">Crysta <span class="font-extrabold text-ink">₹1,799</span></span>
  <!-- live price fades/slides (y 6→0) when it changes -->
</div>
```

Section spacing inside the widget: the panel uses `space-y-3`, the date + time block `mt-4 space-y-3`, and the CTA `mt-5`.

---

### 3.3 Feature & service cards

```html
<article class="card-float card-float-hover group flex flex-col overflow-hidden">
  <div class="relative h-44 overflow-hidden"> <!-- 176px image band (≈ 2.2:1 at 3-up desktop width) -->
    <div class="h-full w-full transition-transform duration-700 ease-premium group-hover:scale-105"><!-- scene / <img class="h-full w-full object-cover"> --></div>
    <div class="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/5 to-transparent"></div>
    <div class="absolute left-4 top-4 flex flex-wrap gap-1.5">
      <span class="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-amber-950 shadow">Most Booked</span>
      <span class="glass rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-800">Fixed Price</span>
    </div>
    <div class="absolute bottom-4 left-4 flex items-center gap-2.5 text-white">
      <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md ring-1 ring-white/30"><!-- icon h-5 w-5 --></span>
      <h3 class="text-xl font-extrabold tracking-tight">Airport Transfers</h3>
    </div>
  </div>
  <div class="flex flex-1 flex-col p-5">
    <p class="text-sm text-slate-600">…</p>
    <ul class="mt-4 space-y-2.5">
      <li class="flex items-start gap-2.5 text-sm font-medium text-slate-700">
        <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-live-500/10 text-live-600"><!-- Check h-3 w-3 strokeWidth 3 --></span>
        Fixed airport fare incl. tolls & parking
      </li>
    </ul>
    <div class="mt-auto flex items-center justify-between gap-3 pt-6">
      <span class="text-sm font-semibold text-slate-500">
        <span class="text-lg font-extrabold text-ink">₹1,499</span>
        <span class="block text-[11px] uppercase tracking-wide">starting fare</span>
      </span>
      <a class="btn-ghost group/btn px-4 py-2.5">Airport taxi <!-- ArrowRight h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 --></a>
    </div>
  </div>
</article>
```

Grid: `mt-12 grid gap-5 md:grid-cols-3`. Entrance per card: `{opacity 0, y 28}` → visible once at viewport margin −60px, 0.6s, staggered by `i × 0.1s`.

**Illustrated scene palettes** (inline SVG, `viewBox 0 0 400 200`, `preserveAspectRatio xMidYMid slice`):

| Scene | Sky gradient | Elements |
|---|---|---|
| Airport | `#1E3A8A → #3B82F6 (60%) → #FDBA74` | sun `#FDE68A` at 55% opacity; runway `#0F172A` with `#FDE68A` dashes; terminal `#1E293B`/`#334155`; plane `#F8FAFC`/`#E2E8F0` |
| Outstation | `#BAE6FD → #FEF3C7` | sun `#FDBA74`; ridges `#64748B` at 55%; hills `#047857` at 85% and `#065F46`; road `#1E293B` with `#FDE68A` dashed centreline |
| Local | `#312E81 → #6366F1` | towers `#1E1B4B` / `#272463`; windows `#FDE68A` at 70%; street `#0F172A` with a `#FDE68A` line |

**Representative photo card** (vehicle pages):

```html
<figure class="card-float overflow-hidden rounded-4xl">
  <div class="relative aspect-[4/3] overflow-hidden bg-slate-200">
    <img loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-700 ease-premium hover:scale-[1.03]" />
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
    <figcaption class="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3 text-white">
      <span>
        <span class="block text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">Luxury 7 Seater</span>
        <span class="block text-lg font-extrabold leading-tight">Toyota Innova Crysta</span>
      </span>
      <span class="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold backdrop-blur-md">24 in fleet</span>
    </figcaption>
  </div>
  <div class="space-y-1 px-4 py-3">
    <p class="flex items-start gap-2 text-[11px] leading-relaxed text-slate-500"><!-- Info mt-px h-3.5 w-3.5 shrink-0 text-slate-400 --> Representative photo. The car assigned to your trip may differ in colour, model year, trim and features.</p>
    <p class="pl-[22px] text-[10px] leading-snug text-slate-400 transition-colors hover:text-slate-600">Photo: … / Wikimedia Commons, CC BY-SA 4.0</p>
  </div>
</figure>
```

**Fleet card:** `card-float card-float-hover relative flex flex-col p-6 sm:p-7`; selected adds `border-brand-300 ring-4 ring-brand-500/10`.
- **Paint swatch:** `h-5 w-5 rounded-full shadow ring-2 ring-white` (background = the paint hex).
- **Spec chips:** `mt-5 grid grid-cols-2 gap-3 text-sm`, each `flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 font-medium text-slate-700` with an icon `h-4 w-4 shrink-0 text-brand-600`.
- **Fare trio:** `mt-6 grid grid-cols-3 divide-x divide-slate-200/80 rounded-2xl border border-slate-200/80 text-center`, cells `p-2.5`, label `text-[10px] font-bold uppercase tracking-wide text-slate-400`, value `text-sm font-extrabold`.
- **Actions:** `mt-5 grid grid-cols-2 gap-2` with a `btn-ghost px-3` and a `btn-primary px-3`.

**Route card:** `card-float card-float-hover group flex h-full flex-col rounded-2xl p-4 text-left`.
- **Top row:** `text-xs font-semibold text-slate-500` with an icon `h-3.5 w-3.5 text-brand-600`, plus an `ArrowUpRight h-4 w-4 text-slate-300` that on group hover moves `-translate-y-0.5 translate-x-0.5` and turns `text-brand-600`.
- **Title:** `mt-1 text-lg font-extrabold tracking-tight`.
- **Meta:** `flex items-center gap-1.5 text-xs text-slate-500`.
- **Highlights:** `mt-2 truncate text-xs text-slate-400`.
- **Fares:** `mt-auto grid grid-cols-2 gap-2 border-t border-slate-100 pt-3`.
- **Footnote:** `mt-1 text-[10px] font-medium text-slate-400`.

**Netflix-style route slider:**

```html
<div class="relative">
  <div class="mb-3 hidden justify-end gap-2 md:flex">
    <button aria-label="Scroll routes left" class="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white text-ink shadow-float transition hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700 disabled:pointer-events-none disabled:opacity-35"><!-- ChevronLeft h-5 w-5 --></button>
    <button aria-label="Scroll routes right" class="…same…"><!-- ChevronRight h-5 w-5 --></button>
  </div>
  <div role="region" tabindex="0" aria-label="Featured routes — scroll horizontally"
       class="no-scrollbar -mr-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-pl-0 py-3 pr-4 sm:-mr-6 sm:pr-6 lg:-mr-8 lg:pr-8 focus-visible:rounded-2xl">
    <div class="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-[29%] xl:w-[23%]"><!-- route card --></div>
    …
  </div>
</div>
```

- **Card widths:** 78% / 44% / 29% / 23% guarantee the next card is partly cut off at the right edge.
- **Gutter bleed:** the negative right margin plus matching padding lets the track bleed through the page gutter, so the cut-off lands on the viewport edge.
- **Arrows:** each click scrolls 85% of the track width (smooth unless reduced motion), and the buttons disable at the start and end.
- **Hover headroom:** `py-3` leaves room for the hover lift, since `overflow-x:auto` also clips vertically.

---

### 3.4 Step-by-step progress timeline ("How booking works")

```html
<section class="relative scroll-mt-24 overflow-hidden bg-white py-16 sm:py-24">
  <div class="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
  <div class="section">
    <div class="mx-auto max-w-2xl text-center">
      <span class="eyebrow">How booking works</span>
      <h2 class="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">From quote to doorstep in four steps</h2>
      <p class="mt-3 text-slate-600">Most customers finish booking in under 60 seconds.</p>
    </div>
    <ol class="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-6">
      <li class="relative flex gap-4 md:flex-col md:items-center md:text-center">
        <!-- connector, mobile (vertical): -->
        <div class="absolute left-[27px] top-14 h-[calc(100%-8px)] w-0.5 bg-slate-200 md:hidden">
          <div class="h-full w-full origin-top bg-brand-600"></div> <!-- scaleY 0→1 -->
        </div>
        <!-- connector, desktop (horizontal, centre-to-centre minus node radius): -->
        <div class="absolute left-[calc(50%+36px)] top-7 hidden h-0.5 w-[calc(100%-72px+24px)] overflow-hidden rounded-full bg-slate-200 md:block">
          <div class="h-full w-full origin-left bg-gradient-to-r from-brand-600 to-brand-400"></div> <!-- scaleX 0→1 -->
        </div>
        <!-- node -->
        <div class="relative z-10 shrink-0">
          <span class="absolute inset-0 animate-pulse-ring rounded-full bg-brand-500/40"></span> <!-- active only -->
          <div class="relative flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all duration-500 border-brand-600 bg-brand-600 text-white shadow-glow">
            <!-- icon h-6 w-6 -->
            <span class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-extrabold ring-2 ring-white bg-ink text-white">1</span>
          </div>
        </div>
        <div class="pb-2 md:mt-5">
          <h3 class="text-base font-extrabold transition-colors text-brand-700">Select Trip & Vehicle</h3>
          <p class="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-600 md:mx-auto">…</p>
        </div>
      </li>
    </ol>
  </div>
</section>
```

| Node state | Circle | Number badge | Title |
|---|---|---|---|
| Active | `border-brand-600 bg-brand-600 text-white shadow-glow` + pulse ring | `bg-ink text-white` | `text-brand-700` |
| Completed (before active) | `border-brand-200 bg-brand-50 text-brand-700` | `bg-slate-100 text-slate-600` | `text-ink` |
| Upcoming | `border-slate-200 bg-white text-slate-500` | `bg-slate-100 text-slate-600` | `text-ink` |

- Connectors are solid lines, with a solid blue fill on mobile and a blue-to-light-blue gradient on desktop. The dashed style is used only for the pickup-to-destination connector inside the booking widget.
- The active step auto-advances every **2.6s** while in view (paused under reduced motion), and hovering a step activates it.
- Steps: Route (Select Trip & Vehicle) → IndianRupee (Instant Transparent Fare) → Car (Driver & Cab Assigned) → Wallet (Travel & Pay).

**Urgent banner** (directly under the timeline):

```html
<div class="relative mt-16 overflow-hidden rounded-4xl bg-gradient-to-br from-brand-800 via-brand-700 to-indigo-700 p-6 text-white shadow-float-lg sm:p-8">
  <div class="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl"></div>
  <div class="pointer-events-none absolute inset-0 bg-grid-slate opacity-20 [background-size:32px_32px]"></div>
  <div class="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
    <div class="flex items-start gap-4">
      <span class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
        <span class="absolute inset-0 animate-pulse-ring rounded-2xl bg-rose-400/40"></span>
        <!-- Siren relative h-6 w-6 -->
      </span>
      <div>
        <p class="text-xl font-extrabold tracking-tight sm:text-2xl">Need a cab in under 2 hours?</p>
        <p class="mt-1 text-sm text-brand-100 sm:text-base">Call our 24/7 hotline directly for immediate dispatch…</p>
      </div>
    </div>
    <div class="flex flex-col gap-2 sm:flex-row">
      <a class="btn bg-white text-brand-800 shadow-float hover:-translate-y-0.5"><!-- Phone h-4 w-4 --> +91 98765 43210</a>
      <a class="btn-whatsapp"><!-- MessageCircle h-4 w-4 --> WhatsApp</a>
    </div>
  </div>
</div>
```

---

### 3.5 Floating action bar & quick-contact buttons

**Mobile/tablet dock** (`< lg`; slides up after 240px of scroll; hidden while the fare drawer is open):

```html
<nav aria-label="Quick actions" class="pb-safe fixed inset-x-0 bottom-0 z-40 px-3 lg:hidden">
  <div class="glass-strong mx-auto flex max-w-lg items-center gap-1 rounded-[28px] p-1.5 shadow-float-lg">
    <a href="tel:…" class="flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-1.5 text-[11px] font-bold text-slate-600 transition active:scale-95">
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-700"><!-- Phone h-4 w-4 --></span>
      Call
    </a>
    <a href="https://wa.me/…" class="…same item classes…">
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-whatsapp/15 text-[#128C4A]"><!-- MessageCircle h-4 w-4 --></span>
      WhatsApp
    </a>
    <button class="…same item classes…">
      <span class="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700"><!-- ReceiptText h-4 w-4 --></span>
      Rates
    </button>
    <button class="btn-primary ml-auto flex-1 rounded-[22px] py-3.5 text-sm">Book Now</button>
  </div>
</nav>
```

- Motion: spring (stiffness 380, damping 34) from `y 120, opacity 0`.
- `.pb-safe` = `padding-bottom: max(1rem, env(safe-area-inset-bottom))`.

**Other quick-contact surfaces:**
- **Header 24/7 call pill** (`md+`, §3.1).
- **WhatsApp button:** `btn-whatsapp` in the CTA band, urgent banner and FAQ.
- **Footer contact list:** `flex items-center gap-2 hover:text-white`, with icons `h-4 w-4 text-brand-400` (phone and mail) and `text-whatsapp` (WhatsApp).

**Persistent WhatsApp floating button:** this build has none. WhatsApp is always one tap away through the mobile dock and CTA buttons. If an existing site needs a desktop floating action button, use this spec, which matches the design system:
- Element: `fixed bottom-6 right-6 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-white shadow-float-lg transition hover:-translate-y-0.5 hover:brightness-95 lg:flex` with a `MessageCircle h-6 w-6` icon.
- `aria-label="Chat on WhatsApp"`.
- Hide it whenever a modal is open.

---

### 3.6 Supporting components

**Section heading:**

```html
<div class="max-w-2xl"> <!-- centered: add "mx-auto text-center" -->
  <span class="eyebrow">Featured routes</span>
  <h2 class="text-balance mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">Popular trips from Bangalore</h2>
  <p class="mt-3 text-slate-600">…</p>
</div>
```

The header row next to it is `flex flex-col items-start justify-between gap-4 md:flex-row md:items-end`, with a `btn-ghost shrink-0` link.

**Inner page hero:**
- Wrapper: `relative overflow-hidden pb-12 pt-28 sm:pt-32`.
- Backdrop: the grid texture plus the ambient blue glow (§1.4).
- Breadcrumb: `mb-5 flex flex-wrap items-center gap-1 text-xs font-semibold text-slate-500`, with links `hover:text-brand-700`, separators `ChevronRight h-3 w-3`, and the current page `text-slate-700`.
- Eyebrow: includes a dot `h-1.5 w-1.5 rounded-full bg-brand-600`.

**CTA band (dark):**

```html
<div class="relative overflow-hidden rounded-4xl bg-ink p-8 text-white shadow-float-lg sm:p-12">
  <div class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl"></div>
  <div class="pointer-events-none absolute -bottom-24 left-10 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl"></div>
  <div class="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
    <div><h2 class="text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">Ready when you are — day or night.</h2><p class="mt-2 text-slate-300">…</p></div>
    <div class="flex flex-col gap-2 sm:flex-row">
      <button class="btn bg-white text-ink hover:-translate-y-0.5">Get instant fare</button>
      <a class="btn border border-white/20 bg-white/10 text-white hover:bg-white/15">Call 24/7</a>
      <a class="btn-whatsapp">WhatsApp</a>
    </div>
  </div>
</div>
```

**Testimonials:**
- Outer: `card-float overflow-hidden p-6 sm:p-10`.
- Quote card: `rounded-2xl border border-slate-200/80 bg-white p-5`.
- Stars: five `h-4 w-4 fill-current` inside `text-amber-400`.
- Quote: `mt-3 text-sm leading-relaxed text-slate-700`.
- Caption: `mt-3 text-xs font-semibold text-slate-500` with the name in `text-ink`.
- Stat tile: `rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5`, value `text-3xl font-extrabold tracking-tight text-brand-700`, label `mt-1 text-sm font-medium text-slate-600`.

**FAQ accordion:**
- Item: `card-float rounded-2xl`; open adds `border-brand-200`.
- Trigger: `flex w-full items-center justify-between gap-4 p-5 text-left`, question `text-[15px] font-bold`.
- Toggle: `flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors` — open `bg-brand-600 text-white` (Minus icon), closed `bg-slate-100 text-slate-600` (Plus icon).
- Answer: `px-5 pb-5 text-sm leading-relaxed text-slate-600`; height animates `0 ↔ auto` over 0.25s.

**Overlay (modal & drawer):**
- Root: `fixed inset-0 z-[60]`.
- Backdrop: `absolute inset-0 bg-slate-900/40 backdrop-blur-sm`.
- Positioning wrapper: `pointer-events-none absolute inset-0 flex`.
  - Drawer: `items-end md:items-stretch md:justify-end md:p-3`.
  - Modal: `items-end justify-center p-3 sm:items-center`.
- Panel: `pointer-events-auto flex w-full flex-col overflow-hidden bg-white shadow-float-lg`.
  - Drawer panel: `max-h-[92dvh] rounded-t-4xl md:max-h-none md:w-[460px] md:rounded-4xl`.
  - Modal panel: `max-h-[88dvh] rounded-4xl sm:w-[640px]`.
- Motion: spring (stiffness 320, damping 32) from `y 48`.
- Behaviour: Esc closes and the body scroll is locked.
- Rule: keep positioning on the wrapper. Never put `-translate-*` centring on the animated panel, because Framer's inline transform overrides it.

**Fare drawer internals:**
- Header: `border-b border-slate-100 px-5 pb-4 pt-5`.
- Progress segments: `h-1 flex-1 overflow-hidden rounded-full bg-slate-100`, filled `bg-brand-600`.
- Trip summary: `rounded-2xl bg-slate-50 p-3`.
- Option card: `w-full rounded-3xl border p-4 text-left transition-all`; selected `border-brand-500 bg-brand-50/50 ring-4 ring-brand-500/10`, otherwise `border-slate-200/80 hover:border-brand-300`.
- Line items: `flex justify-between text-xs`; "Included" in `text-live-600`.
- Sticky footer: `border-t border-slate-100 bg-white/90 px-5 py-4 backdrop-blur`.

**Footer:**
- Wrapper: `bg-ink pb-28 pt-14 text-slate-300 lg:pb-14`.
- Column title: `text-xs font-bold uppercase tracking-[0.12em] text-slate-500`.
- Links: `mt-4 space-y-2 text-sm text-slate-400`, `hover:text-white`.
- Bottom bar: `section mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:justify-between`.

**Skeleton:** `.shimmer` blocks (e.g. `h-24 w-3/5 rounded-[40%]`, `h-3 rounded-full`) with a spinner `h-3.5 w-3.5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent`.

---

## 4. Animation & interaction specifications

### 4.1 Timing tokens

| Token | Value | Use |
|---|---|---|
| `ease-premium` | `cubic-bezier(0.22, 1, 0.36, 1)` | All CSS transitions on cards and buttons; Framer `ease: [0.22, 1, 0.36, 1]` |
| `duration-200` | 200ms | Buttons, fields, chips, veils |
| `duration-300` | 300ms | Cards, header bar state, swap-button rotate |
| `duration-500` | 500ms | Timeline node state |
| `duration-700` | 700ms | Image zoom on card hover |
| Pulse ring | 1.8s `cubic-bezier(0.2,0.6,0.4,1)` infinite | Live dots, active timeline node, siren |
| Shimmer | 1.6s ease-in-out infinite | Skeletons |

### 4.2 Hover / press micro-interactions

| Element | Interaction |
|---|---|
| Buttons | `hover:-translate-y-0.5` (2px lift); press `active:scale-[0.97]` |
| Cards | `hover:-translate-y-1` (4px), border → `slate-300/80`, shadow → `float-lg` |
| Card imagery | `group-hover:scale-105` over 700ms (photo card: `hover:scale-[1.03]`) |
| Arrow icons | `group-hover:translate-x-1` (CTA) / `translate-x-0.5` (card buttons) |
| Dropdown rows | icon tile turns `bg-brand-600 text-white`; trailing arrow fades in and slides from `-translate-x-1` |
| Swap button | `hover:rotate-180` over 300ms |
| Dock items | `active:scale-95` |
| Focus (keyboard) | `ring-2 ring-brand-500 ring-offset-2 ring-offset-white` (global `:focus-visible`) |

### 4.3 Framer Motion variants

```ts
export const EASE = [0.22, 1, 0.36, 1] as const;

// Hero copy — staggered fade-up (custom = index)
export const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.08 * i, ease: EASE } }),
};

// Scroll-reveal cards (services, fleet): once, margin -60px, stagger 0.1s
export const reveal = (i: number) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, delay: i * 0.1, ease: EASE },
});
// Route grid: y 16, duration 0.45, delay (i % 4) * 0.06, margin -40px

// Booking widget panel swap (AnimatePresence mode="wait")
export const panelMotion = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.22, ease: EASE },
};

// Shared-layout active indicators
// service tabs  -> layoutId="service-tab"   spring { stiffness: 420, damping: 34 }
// segmented     -> layoutId per group        spring { stiffness: 500, damping: 38 }
```

| Surface | Enter | Exit | Transition |
|---|---|---|---|
| Nav dropdown | `opacity 0, y 8, scale .98` | `opacity 0, y 6, scale .98` | 0.18s, EASE |
| Mobile menu | `opacity 0, y −12, scale .98` | same | 0.22s, EASE |
| Autocomplete | `opacity 0, y −4, scale .98` | same | 0.15s |
| Calendar pop-up | `opacity 0, y −6, scale .98` | same | 0.16s |
| Modal / drawer | `opacity 0, y 48` | same | spring 320 / 32 |
| Backdrop | `opacity 0` | `opacity 0` | default |
| Mobile dock | `y 120, opacity 0` | same | spring 380 / 34 |
| Drawer steps | `x ±40, opacity 0` (direction-aware) | `x ∓40` | 0.25s |
| FAQ answer | `height 0, opacity 0` | same | 0.25s, EASE |
| Timeline connectors | `scaleY/scaleX 0 → 1` | — | 0.6s / 0.7s, delay 0.3 + i·0.25 / i·0.3 |
| Timeline nodes | `scale 0.6, opacity 0` | — | spring 300 / 20, delay i·0.3 |
| Success check | `scale 0.5, opacity 0` | — | spring 260 / 16, delay 0.1 |
| Live price | `opacity 0, y 6` | `opacity 0, y −6` | `AnimatePresence mode="popLayout"` |

### 4.4 Reduced motion

- **Global CSS:** `@media (prefers-reduced-motion: reduce)` forces `animation-duration` and `transition-duration` to 0.01ms and iterations to 1.
- **Framer:** wrap the app in `<MotionConfig reducedMotion="user">`.
- **JS:** smooth scrolling (anchors, slider arrows) falls back to `behavior: 'auto'`, and the timeline auto-cycle is disabled.

---

## 5. Implementation guide for an existing codebase

### Step 1 — Dependencies

```bash
npm install framer-motion lucide-react
npm install -D tailwindcss@3 postcss autoprefixer
```

You'll also need `react-hook-form`, `zod` and `@hookform/resolvers` if you reuse the booking widget's validation.

### Step 2 — Font

Add the Plus Jakarta Sans `<link>` tags from §1.3 to `<head>` (Next.js: use `next/font/google` with `Plus_Jakarta_Sans`, weights 400–800, and map it to `--font-sans`).

### Step 3 — `tailwind.config.js`

Replace or merge the `theme.extend` block with §1.2 exactly. Make sure `content` covers every file that contains class names. Don't rename tokens (`brand`, `live`, `ink`, `porcelain`, `whatsapp`, `float`, `float-lg`, `glow`, `4xl`, `premium`), because the component classes depend on them.

### Step 4 — `globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html { -webkit-tap-highlight-color: transparent; scroll-behavior: auto; }
  body { @apply bg-porcelain font-sans text-ink antialiased; font-feature-settings: 'ss01', 'cv11'; }
  ::selection { @apply bg-brand-600 text-white; }
  :focus-visible { @apply outline-none ring-2 ring-brand-500 ring-offset-2 ring-offset-white; }
}

/* paste the full @layer components block from §3.0 */

@layer utilities {
  .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .mask-fade-x { mask-image: linear-gradient(to right, transparent, #000 16px, #000 calc(100% - 16px), transparent); }
  .text-balance { text-wrap: balance; }
  .pb-safe { padding-bottom: max(1rem, env(safe-area-inset-bottom)); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Also add `<meta name="theme-color" content="#F8FAFC">` and `viewport-fit=cover` to the viewport meta, so the safe-area padding works on iOS.

### Step 5 — Class helper

```ts
export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');
```

(Or `clsx` + `tailwind-merge` if your codebase already uses them.)

### Step 6 — Replace the layout shell

```tsx
<MotionConfig reducedMotion="user">
  <Header />                      {/* §3.1 — fixed, z-50 */}
  <main className="min-h-[70vh]">
    {/* first section must start with pt-28 sm:pt-32 */}
    {children}
  </main>
  <Footer />                      {/* §3.6 — pb-28 lg:pb-14 */}
  <MobileDock />                  {/* §3.5 — lg:hidden */}
  {/* modals/drawers mount here (z-[60]) */}
</MotionConfig>
```

1. Wrap every page section's content in `.section` (remove old `container`/`max-w-*` wrappers).
2. Apply section rhythm `py-16 sm:py-20` (timeline `py-16 sm:py-24`), and alternate `bg-porcelain` / `bg-white` only between distinct sections.
3. Swap legacy buttons for `.btn-primary` / `.btn-ghost` / `.btn-whatsapp`, cards for `.card-float` (+ `.card-float-hover` when clickable), and inputs for `.field` + `.label`.
4. Rebuild the hero as in §3.2.1, using your own licensed photo (WebP, 1920px + 960px variant) and keeping both gradient scrims. Remove `overflow-hidden` from the hero section if it contains the date-picker pop-up.
5. Home section order: **Hero + widget → Our services → How booking works → Featured routes slider → Featured vehicles → Testimonials → CTA band**.

### Step 7 — Verification checklist

- [ ] Body background `#F8FAFC`, text `#0F172A`, font Plus Jakarta Sans (check DevTools → Computed).
- [ ] Primary buttons `#2563EB` with the blue glow; hover `#1D4ED8` with a 2px lift; press scales to 0.97.
- [ ] Header is a floating rounded pill; it gains `glass-strong` after scrolling 8px.
- [ ] Booking widget: active tab is a white sliding chip; inputs show a 4px `brand-500/10` focus ring.
- [ ] Calendar disables past dates (struck-through) and isn't clipped by its container.
- [ ] Route slider: no visible scrollbar in Chrome, Firefox and Safari; the next card is partly visible; it swipes on touch.
- [ ] Mobile (375px): no horizontal scroll; the dock appears after 240px of scroll and respects the iPhone home bar.
- [ ] Reduced motion: no pulsing, sliding or auto-cycling.
- [ ] Every third-party photo shows its credit line; vehicle photos show the "Representative photo" note.
