import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            DEFAULT: "#6366f1",
            dark: "#4f46e5",
            light: "#818cf8",
          },
          accent: {
            DEFAULT: "#06b6d4",
            dark: "#0891b2",
            light: "#22d3ee",
          },
          surface: {
            DEFAULT: "#1e293b",
            light: "#334155",
            dark: "#0f172a",
          },
          muted: "#94a3b8",
        },
        background: "#0f172a",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.3)",
        "glow-accent": "0 0 20px rgba(6, 182, 212, 0.3)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
