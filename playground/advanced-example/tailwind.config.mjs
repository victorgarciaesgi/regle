/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ...require('tailwindcss/colors'),
        foo: '#eeeeee',
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
