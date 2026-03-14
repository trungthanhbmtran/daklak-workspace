// tailwind.config.js hoặc tailwind.config.ts
const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... các cấu hình khác
  theme: {
    extend: {
      fontFamily: {
        // Gán biến --font-inter vào lớp font-sans của Tailwind
        sans: ["var(--font-inter)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
    },
  },
}
