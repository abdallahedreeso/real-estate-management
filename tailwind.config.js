import animate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: { padding: { DEFAULT: "1rem", lg: "2rem" } },
    screens: { sm: "640px", md: "768px", lg: "1024px", xl: "1234px" },
    fontFamily: {
      pacifico: ["Pacifico", "cursive"],
      dancing: ["Dancing Script", "cursive"],
      primary: "Poppins",
    },
    fontStyle: { pacifico: "cursive" },
    extend: {
      colors: {
        primary: "#101828",
        secondary: "#0D6E67",
        violet: { 50: "#edf7f4", 100: "#d8ede7", 200: "#b7ddd3", 300: "#88c9ba", 400: "#55aa99", 500: "#238b7f", 600: "#0d6e67", 700: "#0b5c56", 800: "#094944", 900: "#102b2a" },
        indigo: { 50: "#edf7f4", 100: "#d8ede7", 200: "#b7ddd3", 300: "#88c9ba", 400: "#55aa99", 500: "#238b7f", 600: "#0d6e67", 700: "#0b5c56", 800: "#094944", 900: "#102b2a" },
      },
      boxShadow: { 1: "0px 4px 30px rgba(0, 0, 0, 0.08)" },
    },
  },
  important: true,
  plugins: [animate],
};
