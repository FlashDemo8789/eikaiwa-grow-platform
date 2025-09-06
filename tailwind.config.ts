import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-inter)', 'var(--font-noto-sans-jp)', 'system-ui', '-apple-system', 'sans-serif'],
        'japanese': ['var(--font-noto-sans-jp)', '"Yu Gothic"', '"Hiragino Kaku Gothic ProN"', '"Meiryo"', 'sans-serif'],
        'mono': ['Consolas', '"SFMono-Regular"', '"Menlo"', 'monospace'],
      },
      colors: {
        // Japanese seasonal colors
        'sakura': {
          50: '#fef7f7',
          100: '#fcecec',
          200: '#f8d2d2',
          300: '#f2b5b5',
          400: '#ea8b8b',
          500: '#F8BBD0', // Main sakura color
          600: '#d4849d',
          700: '#b5647e',
          800: '#975269',
          900: '#7e455a',
        },
        'momiji': {
          50: '#fff4ed',
          100: '#ffe6d5',
          200: '#feccaa',
          300: '#fdac74',
          400: '#fb833c',
          500: '#FF6B35', // Main momiji color
          600: '#ea4e0f',
          700: '#c2380f',
          800: '#9a2e15',
          900: '#7c2814',
        },
        'sora': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#87CEEB', // Main sora color
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'yamabuki': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#F4C430', // Main yamabuki color
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        'murasaki': {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#9A4C95', // Main murasaki color
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        'midori': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#4F7942', // Main midori color
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'seasonal-spring': 'linear-gradient(135deg, #F8BBD0 0%, #FFB6C1 100%)',
        'seasonal-summer': 'linear-gradient(135deg, #87CEEB 0%, #00BFFF 100%)',
        'seasonal-autumn': 'linear-gradient(135deg, #FF6B35 0%, #FF8C00 100%)',
        'seasonal-winter': 'linear-gradient(135deg, #9A4C95 0%, #8A2BE2 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'hanko': '0 2px 8px rgba(204, 0, 0, 0.3)',
        'seasonal': '0 4px 20px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

export default config;