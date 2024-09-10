/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "gray-bg": "#272626",
        "gray-600": "#343434",
        "gray-700": "#BDBDBD",
        "gray-800": "#828282",
        "primary-100": "#4C9D98",
        "primary-200": "#3A7D78",
        "primary-300": "#2A5E5A",
        "secondary-100": "#FAC61D",
        "secondary-200": "#E0A21D",
        "secondary-300": "#C6841D",
      },
      fontFamily: {
        Manrope: ["Manrope", "sans-serif"],
      },
      content: {
        evolvetest: "url('/src/assets/images/EvolveText.svg')",
        waves: "url('/src/assets/images/EvolveText.svg')",
        glow: "url('/src/assets/images/EvolveText.svg')",
        circles: "url('/src/assets/images/EvolveText.svg')",
      },
      screens: {
        "3xl": "1600px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
      },
      animation: {
        marquee: "marquee 10s linear infinite",
      },
    },
    plugins: [],
  },
};
