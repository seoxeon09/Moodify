/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        bounceModal: {
          '0%': { transform: 'translateY(-20%)', opacity: '0' },
          '50%': { transform: 'translateY(0%)', opacity: '1' },
          '70%': { transform: 'translateY(-5%)' },
          '100%': { transform: 'translateY(0%)' },
        },
      },
      animation: {
        bounceModal: 'bounceModal 0.6s ease-out',
      },
    },
  },
  plugins: [],
};
