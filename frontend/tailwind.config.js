/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#ffffff',
        'surface-soft': '#f8fafc',
        hairline: '#e2e8f0',
        ink: '#0f172a',
        body: '#475569',
        mute: '#94a3b8',
        charcoal: '#334155',
        primary: '#0f172a',
      },
      fontFamily: {
        display: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
