/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./src/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      colors: {
        primary: '#1e3a8a',      // Professional dark blue
        secondary: '#3b82f6',    // Medium blue
        accent: '#10b981',       // Success green
        warning: '#f59e0b',      // Amber warning
        danger: '#dc2626',       // Red danger
        success: '#059669',      // Success state
        copy: '#000000',
        background: '#0f172a'    // Dark slate background
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
