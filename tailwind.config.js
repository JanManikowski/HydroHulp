/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0C2074",
          80: "#3D4D90",
          60: "#6D79AC",
          40: "#3D4D90",
          20: "#0C207420"
        },
        secondary: {
          DEFAULT: "#86D2ED",
          80: "#9EDBF1",
          60: "#B0E2F3",
          40: "#CFEDF8",
          20: "#E7F6FB"
        },
        tertiary: {
          DEFAULT: "#008080",
          80: "#FFFFFF",
          60: "#FFFFFF",
          40: "#FFFFFF"
        },
        black: {
          DEFAULT: "#000",
          100: "#030712",
          200: "#111827"
        },
        gray: {
          100: "#4b5563"
        },
        white: "#FFFFFF"
      }
    },
  },
  plugins: [],
}
