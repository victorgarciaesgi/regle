/** @type {import('tailwindcss').Config} */
export default {
  content: ['./docs/.vitepress/**/*.{js,ts,vue}', './docs/**/*.{md,vue}'],
  plugins: [require('@tailwindcss/forms')],
};
