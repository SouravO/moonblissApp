/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    fontFamily: {
      inter: ['Inter', 'system-ui', 'sans-serif'],
      poppins: ['Poppins', 'system-ui', 'sans-serif'],
      sans: ['Poppins', 'system-ui', 'sans-serif'],
      serif: ['Poppins', 'system-ui', 'sans-serif'],
    },
    extend: {
      fontSize: {
        // Premium heading sizes
        'display-lg': ['2.5rem', { lineHeight: '1.2', fontWeight: '900' }],
        'display-md': ['2rem', { lineHeight: '1.3', fontWeight: '800' }],
        'h1': ['1.875rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.5rem', { lineHeight: '1.3', fontWeight: '700' }],
        'h3': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      letterSpacing: {
        'tight-premium': '-0.01em',
        'normal-premium': '0em',
      },
    },
  },
  plugins: [
    function ({ addComponents }) {
      addComponents({
        '.btn-base': {
          '@apply rounded-2xl px-4 py-3 h-12 flex items-center justify-center font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed': {}
        },
        '.btn-primary': {
          '@apply btn-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20': {}
        },
        '.btn-secondary': {
          '@apply btn-base bg-white/10 hover:bg-white/15 text-white border border-white/20': {}
        },
        '.btn-icon': {
          '@apply rounded-2xl w-10 h-10 flex items-center justify-center transition-all active:scale-95': {}
        },
        '.btn-icon-sm': {
          '@apply rounded-xl w-9 h-9 flex items-center justify-center transition-all active:scale-95': {}
        },
      })
    }
  ],
}
