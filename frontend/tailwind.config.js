/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        night: '#171717',
        coal: '#0B0B0B',
        gold: {
          DEFAULT: '#D6A84B',
          light: '#F5C76B',
          deep: '#A67C2B',
          pale: '#EBD3A0',
        },
        burgundy: {
          DEFAULT: '#641C20',
          deep: '#4A1416',
          light: '#8A2A2F',
        },
        cream: '#FFF6E8',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      letterSpacing: {
        label: '0.32em',
        brand: '0.22em',
      },
      boxShadow: {
        gold: '0 0 60px -20px rgba(214,168,75,0.55)',
        'gold-strong': '0 18px 50px -18px rgba(214,168,75,0.65)',
        card: '0 30px 80px -40px rgba(0,0,0,0.95)',
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(90deg, transparent, rgba(214,168,75,0.9), transparent)',
        'gold-sheen':
          'linear-gradient(115deg, #A67C2B 0%, #D6A84B 30%, #F5C76B 50%, #D6A84B 70%, #A67C2B 100%)',
        'hero-vignette':
          'radial-gradient(120% 90% at 70% 20%, rgba(17,17,17,0) 0%, rgba(11,11,11,0.72) 55%, #0B0B0B 100%)',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0,0,0)' },
          to: { transform: 'translate3d(-50%,0,0)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.7', transform: 'scale(1.05)' },
        },
        kenburns: {
          '0%': { transform: 'scale(1.02) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.12) translate3d(0,-1.5%,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        steam: {
          '0%': { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '30%': { opacity: '0.5' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scaleX(1.6)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        floaty: 'floaty 7s ease-in-out infinite',
        glowPulse: 'glowPulse 6s ease-in-out infinite',
        kenburns: 'kenburns 24s ease-out forwards',
        shimmer: 'shimmer 6s linear infinite',
        steam: 'steam 7s ease-out infinite',
        fadeUp: 'fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}
