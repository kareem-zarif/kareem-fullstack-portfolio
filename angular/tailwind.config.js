/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      maxWidth: {
        rail: '1180px',
        'rail-lg': '1320px',
      },
      fontFamily: {
        en: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        ar: ['IBM Plex Sans Arabic', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        lime: {
          DEFAULT: '#a8d234',
          bright: '#b2e742',
        },
        olive: '#6ea30d',
        'dash-green': '#537c0f',
        teal: '#00a389',
        amber: '#ff8400',
        info: '#0b84b5',
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      transitionTimingFunction: {
        brand: 'cubic-bezier(.2,.7,.3,1)',
      },
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '240ms',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2.4s cubic-bezier(.2,.7,.3,1) infinite',
        floaty: 'floaty 7s ease-in-out infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,163,137,.45)' },
          '50%': { boxShadow: '0 0 0 5px rgba(0,163,137,0)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
