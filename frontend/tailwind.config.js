/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef2f0',
          100: '#fee5e0',
          200: '#fcc5bb',
          300: '#f99a8a',
          400: '#f5654d',
          500: '#dd2c00',
          600: '#c52700',
          700: '#a52100',
          800: '#881c00',
          900: '#701700',
          950: '#3d0c00',
        },
        purple: {
          50: '#f5f3f7',
          100: '#ebe6ef',
          200: '#d3c9de',
          300: '#b5a3c6',
          400: '#9279ab',
          500: '#6f5090',
          600: '#5a3d77',
          700: '#472f5e',
          800: '#2d1847',
          900: '#1f1032',
          950: '#100820',
        },
        avenga: {
          red: '#dd2c00',
          purple: '#2d1847',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
