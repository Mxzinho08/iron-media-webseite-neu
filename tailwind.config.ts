import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'sky-blue': '#56B8DE',
        'ocean-blue': '#2E9AC4',
        'deep-teal': '#1B7EA6',
        'off-white': '#FAFCFE',
        'light-gray': '#F4F7FA',
        'medium-gray': '#E2E8F0',
        'text-dark': '#1A1A2E',
        'text-medium': '#4A5568',
        'text-light': '#94A3B8',
        'text-muted': '#CBD5E1',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'hero': 'clamp(52px, 8vw, 108px)',
        'hero-sub': 'clamp(17px, 1.5vw, 21px)',
        'section': 'clamp(2.5rem, 5vw, 5rem)',
        'subsection': 'clamp(1.5rem, 3vw, 2.5rem)',
      },
      spacing: {
        'section-y': 'clamp(80px, 12vh, 160px)',
        'section-x': 'clamp(20px, 5vw, 80px)',
      },
      maxWidth: {
        'container': '1200px',
        'narrow': '900px',
        'wide': '1400px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        'pulse-blue': 'pulseBlue 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'textShimmer 4s ease-in-out infinite',
        'badge-pulse': 'badgePulse 2s ease-out infinite',
        'scroll-dot': 'scrollDot 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite',
      },
      keyframes: {
        pulseBlue: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(46, 154, 196, 0.3), 0 0 40px rgba(46, 154, 196, 0.15)' },
          '50%': { boxShadow: '0 0 30px rgba(46, 154, 196, 0.5), 0 0 60px rgba(46, 154, 196, 0.25)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '-50% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        badgePulse: {
          '0%': { transform: 'scale(1)', opacity: '0.4' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        scrollDot: {
          '0%, 100%': { transform: 'translateY(0)', opacity: '1' },
          '50%': { transform: 'translateY(10px)', opacity: '0.2' },
        },
      },
      backdropBlur: {
        'glass': '20px',
      },
    },
  },
  plugins: [],
}
export default config
