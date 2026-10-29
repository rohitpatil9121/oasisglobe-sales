/** @type {import('tailwindcss').Config} */
// Design system: "Dub" — light canvas, monochrome text, one electric-blue
// accent, borders (not shadows) defining containers. `brand` is remapped to the
// Dub blue so every existing bg-brand/text-brand usage picks up the new accent;
// primary filled actions use near-black `ink` (see components/ui.jsx).
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Accent (Dub Electric Blue / Deep Sapphire). Kept under `brand` so the
        // whole app re-themes without touching every call site.
        brand: {
          DEFAULT: "#2563eb", // electric blue
          dark: "#1e40af",    // deep sapphire (hover / active)
          light: "#93c5fd",
          50: "#eff6ff",
          100: "#dbeafe",
        },
        // Near-black neutrals for text and the primary filled action.
        ink: {
          DEFAULT: "#171717", // charcoal — body text, headings, primary btn
          black: "#0a0a0a",   // midnight ink — max-contrast hover
        },
        // Structural neutrals — borders and alt surfaces (the border-first look).
        ash: "#e5e5e5",   // hairline borders (the default structural line)
        smoke: "#d4d4d4", // stronger borders / emphasis outlines
        paper: "#f5f5f5", // alt surface, hover fills, page background
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        // Border-first: keep card lift barely-there; real depth only on popovers.
        card: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        pop: "0 10px 30px -10px rgb(0 0 0 / 0.25)",
      },
    },
  },
  plugins: [],
};
