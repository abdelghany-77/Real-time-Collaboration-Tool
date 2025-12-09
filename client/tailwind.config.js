/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      screens: {
        xs: "475px",
      },
      colors: {
        "board-bg": "#0079bf",
        "list-bg": "#ebecf0",
        "card-bg": "#ffffff",
        "trello-blue": "#0079bf",
        "trello-blue-dark": "#026aa7",
      },
      boxShadow: {
        card: "0 1px 0 rgba(9,30,66,.25)",
        list: "0 1px 0 rgba(9,30,66,.13)",
      },
      keyframes: {
        "slide-up": {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      animation: {
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [],
};
