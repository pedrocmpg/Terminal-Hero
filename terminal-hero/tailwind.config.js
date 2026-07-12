/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },
      colors: {
        fuchsia: {
          500: '#FF00FF',
        },
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.4)',
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.4)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 20px rgba(34, 211, 238, 0.4)' },
          '50%': { opacity: '.8', boxShadow: '0 0 30px rgba(34, 211, 238, 0.6)' },
        },
      },
    },
  },
  plugins: [],
}
