import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { fontFamily } = require("tailwindcss/defaultTheme");

// eslint-disable-next-line unused-imports/no-unused-vars
const config: Config = {
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
