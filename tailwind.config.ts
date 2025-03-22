import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import plugin from 'tailwindcss/plugin';
import colors from 'tailwindcss/colors';

/**
 * Tailwind CSS Configuration
 *
 * This file configures the Tailwind CSS framework used in the project.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
  },
  theme: {
    extend: {
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
        },
        screens: {
          'sm': '640px',
          'md': '768px',
          'lg': '1024px',
          'xl': '1280px',
          '2xl': '1536px',
        },
      },
      colors: {
        primary: colors.blue,
        secondary: colors.slate,
        accent: colors.emerald,
        success: colors.green,
        warning: colors.yellow,
        error: colors.red,
        info: colors.sky,
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        soft: '0 2px 8px rgb(0 0 0 / 0.08)',
        hover: '0 8px 24px rgb(0 0 0 / 0.12)',
        active:
          '0 1px 10px -3px rgba(0, 0, 0, 0.1), 0 4px 15px -2px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        default: 'var(--radius)',
      },
      spacing: {
        '18': '4.5rem',
        '112': '28rem',
        '128': '32rem',
        '144': '36rem',
      },
      animation: {
        'gradient': 'gradient 3s linear infinite',
        'fade-in': 'fade-in 0.5s ease-in-out',
        'slide-up': 'slide-up 0.5s ease-out',
      },
      keyframes: {
        'gradient': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '75ch',
            color: 'inherit',
            a: {
              'color': 'inherit',
              'textDecoration': 'underline',
              'fontWeight': '500',
              '&:hover': {
                opacity: 0.8,
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    // Add custom base styles
    plugin(({ addBase }) => {
      addBase({
        'html': {
          '@apply antialiased text-gray-900 bg-white dark:text-gray-100 dark:bg-gray-900':
            {},
        },
        '.glass': {
          '@apply bg-white/50 dark:bg-gray-900/50 backdrop-blur-lg': {},
        },
        '.text-gradient': {
          '@apply bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-accent-600':
            {},
        },
        '.focus-ring': {
          '@apply focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2':
            {},
        },
      });
    }),
    // Add form styles
    require('@tailwindcss/forms'),
  ],
};

export default config;
