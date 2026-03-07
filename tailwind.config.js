export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      animation: {
        float1: 'float1 12s ease-in-out infinite',
        float2: 'float2 14s ease-in-out infinite',
        float3: 'float3 16s ease-in-out infinite',
      },
      keyframes: {
        float1: {
          '0%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate(80px,-60px) scale(1.15) rotate(8deg)' },
          '100%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
        },
        float2: {
          '0%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate(-60px,70px) scale(1.12) rotate(-6deg)' },
          '100%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
        },
        float3: {
          '0%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
          '50%': { transform: 'translate(40px,50px) scale(1.18) rotate(5deg)' },
          '100%': { transform: 'translate(0px,0px) scale(1) rotate(0deg)' },
        },
      },
    },
  },
  plugins: [],
};