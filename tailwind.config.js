/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'line-green': '#00B900',
        'line-light-green': '#00C300',
        'line-dark-green': '#009900',
      },
      fontFamily: {
        'line': ['-apple-system', 'BlinkMacSystemFont', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Meiryo', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'spin-reverse': 'spin-reverse 4s linear infinite',
      },
      keyframes: {
        'spin-reverse': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
      },
    },
  },
  plugins: [],
} 