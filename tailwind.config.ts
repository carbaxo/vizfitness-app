import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          950: "#0a0f14",
          900: "#0f1720",
          800: "#16212e",
          700: "#1f2e3f",
          600: "#2b3d52",
        },
        accent: {
          DEFAULT: "#fb7a29",
          dark: "#d95716",
          soft: "#ffae6b",
        },
        cardio: "#f6bf6f",
        gym: "#6aaee8",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
