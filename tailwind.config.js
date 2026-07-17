/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.5rem", lg: "2rem", xl: "3rem" },
    },
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0F",
          soft: "#1A1A24",
          line: "#2A2A38",
          deep: "#050507",
        },
        paper: "#F4EDE0",
        cinnabar: {
          DEFAULT: "#FF2D3D",
          dark: "#C81E2D",
          soft: "#FF5A66",
        },
        celadon: {
          DEFAULT: "#00E5FF",
          dark: "#00B8CC",
          soft: "#5FF0FF",
        },
        gold: {
          DEFAULT: "#FFB800",
          dark: "#CC9300",
          soft: "#FFD766",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', "serif"],
        sans: ['"Noto Sans SC"', "sans-serif"],
        mono: ['"Space Mono"', "monospace"],
      },
      boxShadow: {
        comic: "4px 4px 0 0 #000",
        "comic-lg": "8px 8px 0 0 #000",
        "comic-sm": "2px 2px 0 0 #000",
        "comic-cinnabar": "4px 4px 0 0 #FF2D3D",
        "comic-celadon": "4px 4px 0 0 #00E5FF",
        "comic-gold": "4px 4px 0 0 #FFB800",
        glow: "0 0 24px 0 rgba(255,45,61,0.45)",
        "glow-cyan": "0 0 24px 0 rgba(0,229,255,0.45)",
      },
      backgroundImage: {
        "halftone":
          "radial-gradient(circle, rgba(244,237,224,0.18) 1px, transparent 1.5px)",
        "noise":
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      },
      backgroundSize: {
        "halftone-sm": "8px 8px",
        "halftone-md": "14px 14px",
        "halftone-lg": "22px 22px",
      },
      keyframes: {
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "scroll-x": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "blink-caret": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "float-y": "float-y 3s ease-in-out infinite",
        "scroll-x": "scroll-x 30s linear infinite",
        "blink-caret": "blink-caret 1s step-end infinite",
        marquee: "marquee 40s linear infinite",
        "slide-in": "slide-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};
