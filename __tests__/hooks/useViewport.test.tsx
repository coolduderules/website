/** @format */

import { renderHook } from '@testing-library/react';
import { useViewport } from '../../hooks/useViewport';
import { ViewportContext } from '../../components/Providers';
import { useMediaQuery } from 'react-responsive';
import React from 'react';

// Mock react-responsive d 1
jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

// Clear the global mock from jest.setup.js for this specific test file
jest.unmock('../../hooks/useViewport');

// Mock React's useContext for our tests
jest.mock('react', () => {
  const originalReact = jest.requireActual('react');
  return {
    ...originalReact,
    useContext: jest.fn(),
  };
});

describe('useViewport Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useMediaQuery as jest.Mock).mockImplementation(() => false);

    // Reset the useContext mock to its default behavior
    (React.useContext as jest.Mock).mockImplementation(originalUseContext => {
      return originalUseContext === ViewportContext
        ? {
            isMobile: false,
            isTablet: false,
            isDesktop: false,
            isLargeDesktop: false,
          }
        : undefined;
    });
  });

  it('should return viewport context values', () => {
    const contextValue = {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      isLargeDesktop: false,
    };

    // Override the useContext mock for this test
    (React.useContext as jest.Mock).mockImplementation(context => {
      return context === ViewportContext ? contextValue : undefined;
    });

    const { result } = renderHook(() => useViewport());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.isLargeDesktop).toBe(false);
  });

  it('should calculate derived properties correctly', () => {
    const contextValue = {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeDesktop: false,
    };

    // Override the useContext mock for this test
    (React.useContext as jest.Mock).mockImplementation(context => {
      return context === ViewportContext ? contextValue : undefined;
    });

    const { result } = renderHook(() => useViewport());

    expect(result.current.isSmallDevice).toBe(false);
    expect(result.current.isLargeDevice).toBe(true);
  });

  it('should throw an error when used outside ViewportContext', () => {
    // Make useContext return null to simulate missing context
    (React.useContext as jest.Mock).mockReturnValue(null);

    expect(() => renderHook(() => useViewport())).toThrow(
      'useViewport must be used within a ViewportContext.Provider. ' +
        'Ensure this hook is called within a component wrapped by the Providers component.'
    );
  });
});
