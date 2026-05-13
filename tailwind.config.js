/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}", "./src/**/*.html", "./src/**/*.ts"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji']
      },
      colors: {
        primary: 'rgb(var(--brand-primary-rgb) / <alpha-value>)',
        'primary-dark': 'rgb(var(--brand-primary-dark-rgb) / <alpha-value>)',
        accent: 'rgb(var(--brand-accent-rgb) / <alpha-value>)',
        secondary: '#3b82f6',
        warning: '#f59e0b',
        danger: '#dc2626',
        success: '#059669',
        copy: '#000000',
        background: '#0f172a'
      }
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
