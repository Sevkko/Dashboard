import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        body: ["var(--font-public-sans)", "sans-serif"],
      },
      colors: {
        bg: "var(--bg)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-subtle": "var(--bg-subtle)",
        border: "var(--border)",
        text: "var(--text)",
        "text-muted": "var(--text-muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        positive: "var(--positive)",
        "positive-soft": "var(--positive-soft)",
        negative: "var(--negative)",
        "negative-soft": "var(--negative-soft)",
        warning: "var(--warning)",
        "warning-soft": "var(--warning-soft)",
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "var(--shadow)",
      },
    },
  },
  plugins: [],
};

export default config;
