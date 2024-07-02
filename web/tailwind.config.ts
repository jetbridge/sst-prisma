import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/component/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        fade: {
          '0%': { transform: 'translateY(-30px)', opacity: '0' },
          '40%': { opacity: '0.3' },
          '60%': { opacity: '0.3' },
          '100%': { transform: 'translateY(30px)', opacity: '0' },
        },
      },
      animation: {
        fade: 'fade 4s linear forwards',
      },
    },
  },
  plugins: [],
};
export default config;
