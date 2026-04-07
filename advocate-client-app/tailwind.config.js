/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* LexDesk — aligned with advocate-web-app CRM */
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6fe',
          300: '#a5b8fd',
          400: '#8090fa',
          500: '#6166f5',
          600: '#4f46e5',
          700: '#3730a3',
          800: '#1e1b6b',
          900: '#0f0e3a',
          950: '#07061f',
        },
        gold: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        /* Semantic alias for legacy `primary-*` classes → navy */
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          500: '#6166f5',
          600: '#3730a3',
          700: '#2e2a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
