/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "veag-green": "#10b981",
        "veag-dark-green": "#065f46",
        "veag-light-green": "#d1fae5",
      },
    },
  },
  plugins: [],
};