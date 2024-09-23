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
        "primary-100": "#A259FF", // Purple color for elements
        "primary-200": "#FF62A5", // Pinkish hover color
        "primary-300": "#7E3AC8", // Darker purple for borders
        "secondary-100": "#FAC61D", // Yellow for some highlights
        "secondary-200": "#E0A21D",
        "secondary-300": "#C6841D",
        "skill-bg": "#1E1E1E", // Dark background for skill nodes
      },
      fontFamily: {
        Manrope: ["Manrope", "sans-serif"], // Already present, will apply it site-wide
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
      keyframes: {
        scroll: {
          '0%, 100%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
      },
      animation: {
        scroll: 'scroll 10s linear infinite',
      },
    },
  },
  plugins: [],
};
