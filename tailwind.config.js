/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        ogg: ["Ogg", "serif"],
        cencschit: ["cencschit", "serif"],
        centsbook: ["centsbook", "serif"],
        oggs: ["Oggs", "serif"],
      },
      colors: {
        background: "#080808",
        background2: "#0b0b0d",
        whiteText: "#efefee",
        quotes: "#737373",
        grayText: "#848484",
      },
      animation: {
        "marquee-left": "marquee-left 40s linear infinite",
        "marquee-right": "marquee-right 40s linear infinite",
      },
      keyframes: {
        "marquee-left": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-right": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
