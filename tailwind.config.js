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
        brand: {
          primary: '#5e5ce6',
          secondary: '#818cf8',
          dark: '#4f46e5',
        },
        monster: {
          purple: '#c084fc',
          pink: '#f472b6',
          cyan: '#22d3ee',
        },
        surface: {
          base: 'var(--surface-base)',
          card: 'var(--surface-card)',
          input: 'var(--surface-input)',
          border: 'var(--surface-border)',
          hover: 'rgba(255, 255, 255, 0.03)',
        }
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'zoom-in': 'zoomIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        zoomIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      fontSize: {
        'xxs': '0.625rem', // 10px
      }
    },
  },
  plugins: [],
}