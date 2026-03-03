import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#DD8609',
          soft: '#E5A345',
          deep: '#B36A06'
        },
        brand: {
          ink: '#252321',
          stone: '#7C6E66',
          fog: '#EFEAE5'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
