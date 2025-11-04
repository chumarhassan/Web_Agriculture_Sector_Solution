/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#0B1220',
        primary: '#60A5FA',
        success: '#34D399',
        text: '#E6EEF8',
        muted: '#9CA3AF',
        danger: '#EF4444',
        warning: '#F59E0B'
      }
    },
  },
  plugins: [],
}
