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
    },
  },
  plugins: [],
};
