import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Design-system tokens (design.md §1.2)
        porcelain: "#F8FAFC",
        ink: "#0F172A",
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB", // Electric Cobalt — primary
          700: "#1D4ED8",
          800: "#1E40AF", // Royal Indigo
          900: "#1E3A8A",
          // Legacy storefront tokens (inner pages)
          navy: "#0B1B33",
          "navy-light": "#152D50",
          "navy-dark": "#060F1E",
          offwhite: "#F7F5F0",
          "offwhite-muted": "#EBE8DF",
          orange: "#F0562B",
          "orange-hover": "#D9451C",
          "orange-light": "#FFF3EF",
        },
        live: {
          400: "#34D399",
          500: "#10B981",
          600: "#059669",
        },
        whatsapp: "#25D366",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", '"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"],
        jakarta: ["var(--font-jakarta)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      boxShadow: {
        float: "0 18px 40px -14px rgba(15, 23, 42, 0.16), 0 2px 6px -2px rgba(15, 23, 42, 0.06)",
        "float-lg": "0 32px 70px -20px rgba(15, 23, 42, 0.28), 0 4px 12px -4px rgba(15, 23, 42, 0.08)",
        glow: "0 12px 30px -8px rgba(37, 99, 235, 0.55)",
        "glow-live": "0 0 0 4px rgba(16, 185, 129, 0.18)",
        "inner-hair": "inset 0 1px 0 0 rgba(255, 255, 255, 0.7)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      backgroundImage: {
        "grid-slate":
          "linear-gradient(to right, rgba(15,23,42,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.045) 1px, transparent 1px)",
        "grid-white":
          "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
        "dawn-sky": "linear-gradient(180deg, #DBEAFE 0%, #EFF6FF 45%, #FEF3C7 100%)",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        // CSS equivalents of the design.md §4.3 Framer variants
        "panel-in": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "drop-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "sheet-in": {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Modal / drawer entrance (design.md §4.3: y 48 → 0, spring 320/32)
        "drawer-in": {
          "0%": { opacity: "0", transform: "translateY(48px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "step-in": {
          "0%": { opacity: "0", transform: "translateX(40px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "pulse-ring": "pulse-ring 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        float: "float 5s ease-in-out infinite",
        "panel-in": "panel-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pop-in": "pop-in 0.16s cubic-bezier(0.22, 1, 0.36, 1) both",
        "drop-in": "drop-in 0.18s cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-in": "sheet-in 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-up": "fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 0.2s ease-out both",
        "drawer-in": "drawer-in 0.42s cubic-bezier(0.34, 1.2, 0.64, 1) both",
        "step-in": "step-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
