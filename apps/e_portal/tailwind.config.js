import { heroui } from "@heroui/theme"
import plugin from "tailwindcss/plugin"

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        verticalMarquee: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        glow: {
          "0%,100%": { opacity: 0.85 },
          "50%": { opacity: 1 },
        },
      },
      animation: {
        verticalMarquee: "verticalMarquee var(--marquee-duration, 18s) linear infinite",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  darkMode: "class",
  plugins: [
    heroui(),

    // 👇 thêm plugin custom để re-define animations sau HeroUI
    plugin(({ addUtilities, theme }) => {
      addUtilities({
        "@keyframes translateX": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        ".animate-runningText": {
          animation: "translateX 10s linear infinite",
        },
        ".pause-marquee": { "animation-play-state": "paused" },
        ".fade-top": {
          "mask-image": "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)",
          "-webkit-mask-image": "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)",
          "mask-repeat": "no-repeat",
          "-webkit-mask-repeat": "no-repeat",
        },
        ".fade-bottom": {
          "mask-image": "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)",
          "-webkit-mask-image": "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%)",
          "mask-repeat": "no-repeat",
          "-webkit-mask-repeat": "no-repeat",
        },
        ".led-glow": {
          "animation": "glow 2s ease-in-out infinite",
          "will-change": "opacity, transform",
        },
      })
    }),
  ],
}

export default config
