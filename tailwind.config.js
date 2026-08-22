/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lobster: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffb8b8',
          300: '#ff8080',
          400: '#ff4d4d',
          500: '#e63946',
          600: '#c62a35',
          700: '#a01e27',
          800: '#7d1820',
          900: '#5c1219',
        },
        ocean: {
          400: '#2a8fd6',
          500: '#1a73b8',
          600: '#155e99',
        },
      },
    },
  },
  plugins: [],
}
