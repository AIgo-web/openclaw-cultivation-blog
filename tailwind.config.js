/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '375px',
      },
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
          50: '#e8f4fd',
          100: '#c6e4f9',
          200: '#8ec8f2',
          300: '#56abe9',
          400: '#2a8fd6',
          500: '#1a73b8',
          600: '#155c96',
          700: '#104673',
          800: '#0b3050',
          900: '#061e30',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans SC', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.lobster.500'),
              '&:hover': { color: theme('colors.lobster.700') },
            },
            'h1,h2,h3,h4': { color: theme('colors.gray.900') },
            code: {
              color: theme('colors.lobster.600'),
              backgroundColor: theme('colors.gray.100'),
              borderRadius: '0.25rem',
              padding: '0.1em 0.3em',
            },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            'h1,h2,h3,h4': { color: theme('colors.gray.100') },
            code: {
              color: theme('colors.lobster.300'),
              backgroundColor: theme('colors.gray.800'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
