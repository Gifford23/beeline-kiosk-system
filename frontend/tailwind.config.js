/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#D71920", // Jollibee Red
          yellow: "#FCB813", // Jollibee Yellow
          dark: "#333333", // Dark Gray text
          gray: "#F4F4F4", // Light Gray background
        },
      },
      fontFamily: {
        sans: ["Nunito", "sans-serif"], // Friendly Rounded Font
      },
      animation: {
        "bounce-slow": "bounce 3s infinite",
      },
    },
  },
  plugins: [],
};
