import { useContext, useMemo } from 'react';
import { ViewportContext } from '@/components/Providers';
import { env } from '@/utils/env';

// Common breakpoint sizes that align with Tailwind CSS defaults
export const breakpoints = {
  'sm': 640,
  'md': 768,
  'lg': 1024,
  'xl': 1280,
  '2xl': 1536,
};

export interface ViewportResult {
  // Base properties from context
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;

  // Derived properties
  isSmallDevice: boolean; // Mobile or tablet
  isLargeDevice: boolean; // Desktop or large desktop

  // Helper methods
  isGreaterThan: (breakpoint: keyof typeof breakpoints) => boolean;
  isLessThan: (breakpoint: keyof typeof breakpoints) => boolean;
  isBetween: (
    minBreakpoint: keyof typeof breakpoints,
    maxBreakpoint: keyof typeof breakpoints
  ) => boolean;
}

/**
 * Custom hook to access viewport information and responsive utilities
 * Must be used within components wrapped by the Providers component
 */
export function useViewport(): ViewportResult {
  const context = useContext(ViewportContext);

  if (!context) {
    const error = new Error(
      'useViewport must be used within a ViewportContext.Provider. ' +
        'Ensure this hook is called within a component wrapped by the Providers component.'
    );

    if (env.NODE_ENV === 'development') {
      console.error(
        '[useViewport] Context Error:',
        '\nCheck the component tree structure:',
        '\n- Providers should be near the root of your app',
        '\n- Current component might be rendered outside of Providers',
        '\n- Viewport context values may be undefined during SSR'
      );
    }

    throw error;
  }

  // Create extended viewport utilities using memoization for performance
  const viewportUtils = useMemo(() => {
    // Calculate current viewport width (best approximation from context)
    let currentWidth = 1024; // Default to desktop

    if (context.isMobile) currentWidth = 480;
    else if (context.isTablet) currentWidth = 768;
    else if (context.isDesktop) currentWidth = 1024;
    else if (context.isLargeDesktop) currentWidth = 1536;

    return {
      ...context,
      // Derived properties
      isSmallDevice: context.isMobile || context.isTablet,
      isLargeDevice: context.isDesktop || context.isLargeDesktop,

      // Helper methods
      isGreaterThan: (breakpoint: keyof typeof breakpoints) =>
        currentWidth >= breakpoints[breakpoint],

      isLessThan: (breakpoint: keyof typeof breakpoints) =>
        currentWidth < breakpoints[breakpoint],

      isBetween: (
        minBreakpoint: keyof typeof breakpoints,
        maxBreakpoint: keyof typeof breakpoints
      ) =>
        currentWidth >= breakpoints[minBreakpoint] &&
        currentWidth < breakpoints[maxBreakpoint],
    };
  }, [
    context.isMobile,
    context.isTablet,
    context.isDesktop,
    context.isLargeDesktop,
  ]);

  return viewportUtils;
}
