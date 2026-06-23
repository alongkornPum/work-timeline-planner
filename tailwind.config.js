/** @type {import('tailwindcss').Config} */
export default {
  // ปิด preflight เพื่อไม่ให้ Tailwind reset ทับสไตล์ของ Material UI
  corePlugins: {
    preflight: false,
  },
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans Thai"', '"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
