import { Fira_Code as FontMono, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});


// import localFont from "next/font/local";

// export const fontSans = localFont({
//   src: "../public/fonts/Inter-Regular.woff2",
//   variable: "--font-sans",
//   display: "swap",
// });