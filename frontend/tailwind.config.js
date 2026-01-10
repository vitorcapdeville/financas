/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Financial Serenity Color Palette
        emerald: {
          dark: "#0f3d3e",
          DEFAULT: "#156064",
          light: "#2a7c7f",
        },
        bronze: {
          DEFAULT: "#b8860b",
          light: "#daa520",
        },
        gold: "#d4af37",
        cream: "#faf8f5",
        taupe: "#d4c5b9",
        stone: "#8b8378",
        charcoal: "#2d2d2d",
        success: "#2d8659",
        error: "#c44536",
        warning: "#e67e22",
        // Legacy primary colors (mantido para compatibilidade)
        primary: {
          50: "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
        },
      },
      fontFamily: {
        display: ["DM Serif Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(47, 43, 67, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        md: "0 4px 6px rgba(47, 43, 67, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)",
        lg: "0 10px 15px rgba(47, 43, 67, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px rgba(47, 43, 67, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
