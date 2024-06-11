/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#042f2e',
        secondary: {
          DEFAULT: "#f0fdfa",
          100: "#ccfbf1",
          200: "#99f6e4"
        },
        black: {
          DEFAULT: "#000",
          100: "#030712",
          200: "#111827"
        },
        gray: {
          100: "#4b5563"
        }
      }
    },
  },
  plugins: [],
}
