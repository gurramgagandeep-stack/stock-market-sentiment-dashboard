/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0faf4',
          100: '#dcf5e6',
          200: '#bbe9cf',
          300: '#86d5ab',
          400: '#4dba80',
          500: '#00b386',   // Groww primary green
          600: '#009e76',
          700: '#007a5c',
          800: '#005f48',
          900: '#004d3b',
        },
        surface: {
          50:  '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
        },
        positive: '#00b386',
        negative: '#e74c3c',
        neutral:  '#8c92a0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        elevated: '0 4px 16px 0 rgba(0,0,0,0.10)',
        glow: '0 0 20px rgba(0,179,134,0.18)',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
    },
  },
  plugins: [],
}
