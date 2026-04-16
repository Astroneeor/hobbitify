/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Buildspace-inspired clean color system
        "bg-primary": "#0a0a0a", // Deep black background
        "bg-secondary": "#111111", // Slightly lighter black
        "bg-tertiary": "#1a1a1a", // Card backgrounds
        "bg-hover": "#262626", // Hover states
        
        "text-primary": "#ffffff", // Pure white text
        "text-secondary": "#a3a3a3", // Gray text
        "text-muted": "#737373", // Muted text
        
        "accent-primary": "#3b82f6", // Clean blue accent
        "accent-hover": "#2563eb", // Darker blue for hover
        "accent-light": "#60a5fa", // Light blue
        
        "border-primary": "#262626", // Subtle borders
        "border-secondary": "#404040", // More visible borders
        
        "success": "#10b981", // Green for success states
        "warning": "#f59e0b", // Orange for warnings
        "error": "#ef4444", // Red for errors
        
      },
      fontFamily: {
        Manrope: ["Manrope", "sans-serif"], // Already present, will apply it site-wide
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        scroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        marquee: "marquee 10s linear infinite",
        scroll: 'scroll 15s linear infinite',
        fadeIn: 'fadeIn 0.6s ease-out',
        slideInLeft: 'slideInLeft 0.6s ease-out',
        slideInRight: 'slideInRight 0.6s ease-out',
        pulse: 'pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
