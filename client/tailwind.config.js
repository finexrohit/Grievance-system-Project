/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        test: {
          red: '#CC0000',
          darkred: '#990000',
          lightred: '#FF4D4D',
          silver: '#E5E7EB',
          dark: '#111827',
          card: '#1F2937'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
