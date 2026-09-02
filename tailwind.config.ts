import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090B",
        foreground: "#F4F6EC",
        neon: {
          DEFAULT: "#CCFF00",
          hover: "#B8E600",
          glow: "rgba(204, 255, 0, 0.35)",
        },
        primary: {
          DEFAULT: "#4FD1FF",
          foreground: "#08090B",
          glow: "rgba(79, 209, 255, 0.35)",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          hover: "rgba(255, 255, 255, 0.08)",
          card: "rgba(14, 18, 13, 0.8)",
          border: "rgba(255, 255, 255, 0.1)",
          neonBorder: "#CCFF00",
        },
        winter: {
          night: "#08090B",
          dark: "#0E120D",
          card: "#131812",
          muted: "#849182",
        }
      },
      fontFamily: {
        display: ["Anton", "sans-serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
        glass: "16px",
      },
      animation: {
        "glow-pulse": "glow-pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
        "soundwave": "soundwave 1.2s ease-in-out infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        "soundwave": {
          "0%, 100%": { height: "4px" },
          "50%": { height: "24px" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
