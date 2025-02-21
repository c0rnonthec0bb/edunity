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
          DEFAULT: '#F3AD0A',
          50: '#FCE7B0',
          100: '#FCE19C',
          200: '#FBD574',
          300: '#FAC94C',
          400: '#F9BD24',
          500: '#F3AD0A',
          600: '#BB8508',
          700: '#835D05',
          800: '#4B3503',
          900: '#130E01',
          950: '#000000'
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/line-clamp')
  ],
}
