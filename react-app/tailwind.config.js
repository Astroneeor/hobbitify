/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Subnautica abyss palette — replaces old buildspace tokens
        "bg-primary":   "#191c24",  // --abyss-0
        "bg-secondary": "#1e2130",  // --abyss-1
        "bg-tertiary":  "#252937",  // --clay-deep
        "bg-hover":     "#2d3245",  // --clay-surface

        "text-primary":   "#eef0f5", // --ink
        "text-secondary": "#b2b8c8", // --ink-mute
        "text-muted":     "#76809a", // --ink-dim

        // Bioluminescent cyan
        "accent-primary": "#3f9bbf",
        "accent-hover":   "#3385a3",
        "accent-light":   "#7acce6",

        "border-primary":   "#383d52", // --clay-edge
        "border-secondary": "#2b3044", // --clay-edge-soft

        "success": "#3dca8a", // --bio-kelp
        "warning": "#d9b248", // --bio-amber
        "error":   "#d05840", // --bio-coral
      },
      fontFamily: {
        // "font-Manrope" now maps to Space Grotesk (no class renames needed)
        Manrope:  ["Space Grotesk", "system-ui", "sans-serif"],
        display:  ["DM Serif Display", "Georgia", "serif"],
        mono:     ["JetBrains Mono", "Consolas", "monospace"],
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        fadeIn: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "from": { transform: "translateX(20px)", opacity: "0" },
          "to":   { transform: "translateX(0)",    opacity: "1" },
        },
        heroKicker: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heroLineA: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        heroLineB: {
          "0%":   { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        orbDrift: {
          "0%, 100%": { transform: "translate(-50%, 0) scale(1)",    opacity: "0.38" },
          "50%":      { transform: "translate(-49%, 6%) scale(1.08)", opacity: "0.52" },
        },
        ping: {
          "0%":   { width: "0",     height: "0",     opacity: "0.7" },
          "100%": { width: "480px", height: "480px", opacity: "0" },
        },
        causticsShift: {
          "0%":   { transform: "translate(0, 0) scale(1)" },
          "50%":  { transform: "translate(-3%, 2%) scale(1.05)" },
          "100%": { transform: "translate(2%, -2%) scale(1.02)" },
        },
        glowPulse: {
          "0%, 100%": { filter: "brightness(1)" },
          "50%":      { filter: "brightness(1.25)" },
        },
      },
      animation: {
        marquee:      "marquee 10s linear infinite",
        fadeIn:       "fadeIn 0.6s ease-out",
        "slide-in":   "slideIn 0.25s cubic-bezier(.2,.8,.2,1)",
        "hero-kicker": "heroKicker 0.85s ease-out both",
        "hero-line-a": "heroLineA 1s ease-out 0.08s both",
        "hero-line-b": "heroLineB 1s ease-out 0.22s both",
        "orb-drift":   "orbDrift 22s ease-in-out infinite",
        "ping-ring":   "ping 4s ease-out infinite",
        "glow-pulse":  "glowPulse 3s ease-in-out infinite",
        "caustics":    "causticsShift 24s ease-in-out infinite alternate",
      },
    },
  },
  plugins: [],
};
