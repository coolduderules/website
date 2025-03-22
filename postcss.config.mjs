/**
 * PostCSS Configuration
 * 
 * Configures PostCSS plugins for optimal CSS processing:
 * - tailwindcss: Processes Tailwind CSS directives and utilities
 * - autoprefixer: Adds vendor prefixes based on browserslist
 * - cssnano: Minifies CSS in production
 */

// Custom environment handling for GitHub compatibility
const getEnv = () => {
  return {
    NODE_ENV: process.env.NODE_ENV || 'development',
  };
};

const env = getEnv();

const config = {
  plugins: {
    // Process Tailwind CSS directives first
    'tailwindcss/nesting': {},
    tailwindcss: {},
    
    // Add vendor prefixes
    autoprefixer: {
      flexbox: 'no-2009',
      grid: 'autoplace',
      remove: false // Keep prefixes that are still relevant
    },
    
    // Production optimizations
    ...(env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['default', {
          discardComments: { removeAll: true },
          normalizeWhitespace: false,
          svgo: false, // Disable SVG optimization to prevent issues
          reduceIdents: false, // Prevent breaking keyframe animations
          zindex: false, // Prevent breaking z-index layers
          mergeLonghand: false // Prevent merging properties that should stay separate
        }]
      }
    } : {})
  },
};

export default config;
