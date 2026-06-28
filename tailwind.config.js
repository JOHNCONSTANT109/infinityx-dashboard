/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          cyan: "#00d4ff",
          yellow: "#ffd700",
          purple: "#7c3aed",
          dark: "#0d0f1a",
          navy: "#111827",
          card: "#1a1f2e",
          border: "#2a2f45",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Orbitron", "sans-serif"],
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #00d4ff 0%, #ffd700 100%)",
        "gradient-dark": "linear-gradient(180deg, #0d0f1a 0%, #111827 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        glow: "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glow: {
          "0%": { textShadow: "0 0 10px #00d4ff" },
          "100%": { textShadow: "0 0 30px #00d4ff, 0 0 60px #ffd700" },
        },
      },
    },
  },
  plugins: [],
};
