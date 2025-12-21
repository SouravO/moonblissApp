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
  plugins: [],
}
