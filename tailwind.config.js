/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
        },
        navy: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        premium:
          "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        "premium-lg":
          "0 4px 6px rgba(15, 23, 42, 0.04), 0 12px 32px rgba(15, 23, 42, 0.08)",
        glow: "0 0 40px rgba(245, 158, 11, 0.15)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 40% 20%, rgba(245, 158, 11, 0.08) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(15, 23, 42, 0.04) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(245, 158, 11, 0.05) 0px, transparent 50%)",
        "auth-gradient":
          "linear-gradient(135deg, #020617 0%, #0f172a 40%, #1e293b 100%)",
      },
    },
  },
  plugins: [],
};
