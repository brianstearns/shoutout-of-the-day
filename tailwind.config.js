/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7def9f",
        secondary: "#60c87f",
        backgroundLight: "#f1f1f1",
        backgroundDark: "#222222",
        cardLight: "#ffffff",
        cardDark: "#242424",
        textLight: "#242424",
        textDark: "#ffffff",
      },
    },
  },
  plugins: [],
};
