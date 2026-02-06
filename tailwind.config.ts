import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#F0DFCA',
        'light-green': '#A9B27A',
        'dark-green': '#656B35',
        'light-brown': '#A78B69',
        'dark-brown': '#695238',
        'light-blue': '#B6C5D7',
        gray: '#838078',
        black: '#463C34',
      },
      fontFamily: {
        mono: ['Courier Prime', 'monospace'],
        sans: ['Courier Prime', 'monospace'],
      },
      fontSize: {
        'fluid-xs': 'clamp(0.625rem, 0.5rem + 0.625vw, 0.75rem)',
        'fluid-sm': 'clamp(0.75rem, 0.625rem + 0.625vw, 0.875rem)',
        'fluid-base': 'clamp(0.875rem, 0.75rem + 0.625vw, 1rem)',
        'fluid-lg': 'clamp(1rem, 0.875rem + 0.625vw, 1.125rem)',
        'fluid-xl': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.25rem + 1.25vw, 2rem)',
        'fluid-3xl': 'clamp(1.875rem, 1.5rem + 1.875vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.25rem, 1.75rem + 2.5vw, 3.5rem)',
      },
    },
  },
  plugins: [],
};

export default config;