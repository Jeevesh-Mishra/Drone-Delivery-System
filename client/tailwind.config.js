/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dashboard: '#60a5fa', // Soft Blue accent
          fleet: '#3b82f6',     // Electric Blue accent
          route: '#10b981',     // Emerald Green accent
          delivery: '#f97316',  // Warm Orange accent
          analytics: '#8b5cf6', // Royal Purple accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
