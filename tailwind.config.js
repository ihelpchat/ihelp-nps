/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ea5f3d',
          50: '#fef2f0',
          100: '#fde6e1',
          200: '#fbd0c7',
          300: '#f7b0a0',
          400: '#f2866d',
          500: '#ea5f3d',
          600: '#d94527',
          700: '#b5371f',
          800: '#932f1d',
          900: '#792c1c',
          950: '#41130c'
        }
      }
    },
  },
  plugins: [],
};
