/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'deck-blue': '#3B82F6',
        'deck-red': '#EF4444',
        'deck-green': '#10B981',
        'deck-yellow': '#F59E0B',
        'deck-purple': '#8B5CF6',
        'deck-pink': '#EC4899',
        'deck-cyan': '#06B6D4',
        'deck-lime': '#84CC16'
      }
    },
  },
  plugins: [],
}