/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Bengali"', 'system-ui', 'sans-serif'],
        serif: ['"Noto Serif Bengali"', '"Noto Sans Bengali"', 'serif'],
      },
    },
  },
  plugins: [],
};
