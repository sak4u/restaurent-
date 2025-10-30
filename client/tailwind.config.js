/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",         // si tu as un fichier HTML à la racine
    "./src/**/*.{js,jsx,ts,tsx}",  // tous les fichiers React sous src/
  ],
  theme: {
    extend: {
      colors: {
        // Tu peux personnaliser les couleurs si besoin
        blue: {
          500: '#3b82f6',  // bleu par défaut Tailwind, mais tu peux changer
        },
        orange: {
          500: '#f97316',
        },
        green: {
          100: '#d1fae5',
          800: '#166534',
        },
        yellow: {
          100: '#fef3c7',
          800: '#92400e',
        },
        purple: {
          500: '#8b5cf6',
        },
        pink: {
          500: '#ec4899',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          600: '#4b5563',
          800: '#1f2937',
          900: '#111827',
        }
      }
    }
  },
  plugins: [],
  darkMode: 'class', // optionnel, active le dark mode via une classe CSS 'dark'
};
