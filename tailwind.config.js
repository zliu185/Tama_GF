/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        blush: '#fff3f6',
        rosemilk: '#ffdce4',
        berry: '#d66b86',
        plum: '#7f4b5f',
        mint: '#d6f5ea'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(127, 75, 95, 0.12)'
      }
    }
  },
  plugins: []
};
