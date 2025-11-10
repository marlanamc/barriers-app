/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pastel gradient colors for barrier cards
        pastel: {
          pink: '#FFD6E8',
          purple: '#E6D6FF',
          blue: '#D6E8FF',
          green: '#D6FFE8',
          yellow: '#FFEFD6',
          peach: '#FFE6D6',
        }
      }
    },
  },
  plugins: [],
}
