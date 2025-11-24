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
      fontFamily: {
        // Clean, readable fonts for ADHD accessibility
        cinzel: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
        crimson: ['var(--font-source-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Pastel gradient colors for barrier cards
        pastel: {
          pink: '#FFD6E8',
          purple: '#E6D6FF',
          blue: '#D6E8FF',
          green: '#D6FFE8',
          yellow: '#FFEFD6',
          peach: '#FFE6D6',
        },
        // Calming pastel lavender colors for light mode
        lavender: {
          50: '#FAF8FF',
          100: '#F3F0FF',
          200: '#E8E2FF',
          300: '#D4C7FF',
          400: '#B8A3FF',
          500: '#9B7FFF',
          600: '#7C5AFF',
          700: '#5D3AFF',
          800: '#4A2ED9',
          900: '#3A23B3',
        }
      }
    },
  },
  plugins: [],
}
