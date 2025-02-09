/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        theme: {
          DEFAULT: '#E07240',
          50: '#F9DDD2',
          100: '#F7D1C2',
          200: '#F2B9A1',
          300: '#ECA181',
          400: '#E68960',
          500: '#E07240',
          600: '#C85620',
          700: '#964018',
          800: '#642B10',
          900: '#321508',
          950: '#190A04'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}
