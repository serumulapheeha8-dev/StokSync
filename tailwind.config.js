/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#1D9E75',
        'brand-dark': '#0F6E56',
        'brand-light': '#E1F5EE',
      },
    },
  },
  plugins: [],
}
