import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f0ff',
          100: '#e8e8ff',
          200: '#d0d0ff',
          300: '#b8b5ff',
          400: '#a5a6ff',
          500: '#8b8cff',
          600: '#7a7ae6',
          700: '#6a6acc',
          800: '#5a5ab3',
          900: '#4a4a99',
          950: '#3a3a80',
        },
        secondary: {
          50: '#fff0f3',
          100: '#ffe8ec',
          200: '#ffb5c2',
          300: '#ff8e9e',
          400: '#ff6b80',
          500: '#ff4d6a',
          600: '#e63e5a',
          700: '#cc304a',
          800: '#b32a3d',
          900: '#992030',
          950: '#801828',
        },
        soft: {
          violet: '#e8e8ff',
          pink: '#ffe8ec',
          mint: '#e6f7ee',
          peach: '#fff4d6',
          sky: '#e8f2ff',
          lavender: '#f0e8ff',
        },
        accent: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
