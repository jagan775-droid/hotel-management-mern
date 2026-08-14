/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14203A",
        teal: { DEFAULT: "#0F5257", light: "#15707A" },
        brass: { DEFAULT: "#B8895D", light: "#D6AD87" },
        paper: "#FAF8F4",
        slate: "#5B6472",
        success: "#3F7D5C",
        warning: "#C08A2E",
        danger: "#B4463C",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};
