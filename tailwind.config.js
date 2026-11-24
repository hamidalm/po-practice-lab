import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#e9f2ff', 100: '#cce0ff', 500: '#1d6ce0', 600: '#0c5bd0', 700: '#0a4aa8' },
        ink: { 900: '#172b4d', 700: '#44546f', 500: '#626f86', 300: '#b3bac5', 100: '#f1f2f4' },
      },
    },
  },
  plugins: [typography],
};
