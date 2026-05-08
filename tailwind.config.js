/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "lavender--600": "#5c95e0",
        "lavender-light-400": "#b1c9ef",
        "lavender--500": "#7aa7e8",
        "lavender--100": "#eaf1fc",  
        "lavender--50": "#f4f7fe",
      },
    }, 
  },
  plugins: [require("flowbite/plugin")],
};