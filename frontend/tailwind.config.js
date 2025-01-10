/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'smokeyBlack':'#100c08',
        'coalBlack' : '#1a1918',

      },
      backgroundImage: {
        'wood': "url('/src/assets/wood.jpg')",
        'darkwood': "url('/src/assets/darkwood.webp')",
        'nosignal': "url('/src/assets/nosignal.png')",
        'szszsz': "url('/src/assets/szszsz.jpg')"
      },
    },
  },
  plugins: [],
}

