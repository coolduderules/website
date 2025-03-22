/** @format */
'use client';

import * as React from 'react';
import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { TelegramUser, TelegramAuthResponse } from '@/types/telegram';
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMediaQuery } from 'react-responsive';
import { errorTracker } from '@/utils/errorTracking';
import { z } from 'zod';
import { env } from '@/utils/env';
import { fetch } from '@cloudflare/workers-types';
import { get, url } from '@types/react-dom/client';

declare global {
  interface Window {
    matchMedia: (query: string) => MediaQueryList;
  }
}

// Schema definitions
const errorResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string().optional(),
});

const userResponseSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  auth_date: z.number(),
  hash: z.string(),
  username: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  bot_name: z.string().optional(),
});

// Type definitions
export interface AuthContextType {
  user: TelegramUser | null;
  login: (userData: TelegramAuthResponse) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;
}

export interface ViewportContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
}

// Context creation
export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => {},
  logout: () => {},
  isLoading: false,
  error: null,
});

export const ViewportContext = createContext<ViewportContextType>({
  isMobile: false,
  isTablet: false,
  isDesktop: false,
  isLargeDesktop: false,
});

// Utility functions
const validateUser = async (userData: TelegramUser): Promise<void> => {
  const response = await fetch('/api/auth/telegram', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('User validation failed');
  }
};

// Auth Provider Component
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // User authentication state restoration
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      const storedUser = window.localStorage.getItem('telegram_user');
      if (!storedUser) return;

      const parsedUser = JSON.parse(storedUser);
      const userResult = userResponseSchema.safeParse(parsedUser);

      if (!userResult.success) {
        throw new Error('Invalid stored user data');
      }

      // Convert to TelegramUser type
      const validUser: TelegramUser = {
        ...userResult.data,
        username: userResult.data.username || null,
        photo_url: userResult.data.photo_url || null,
        bot_name: userResult.data.bot_name || '',
      };

      setUser(validUser);
    } catch (error) {
      errorTracker.captureException(error);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('telegram_user');
      }
      setUser(null);
    }
  }, []);

  const login = useCallback(async (userData: TelegramAuthResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const rawData = await response.json();

      if (!response.ok) {
        const errorResult = errorResponseSchema.safeParse(rawData);
        const errorMessage = errorResult.success
          ? errorResult.data.message || errorResult.data.error || 'Login failed'
          : 'Login failed';
        throw new Error(errorMessage);
      }

      const userResult = userResponseSchema.safeParse(rawData);

      if (!userResult.success) {
        errorTracker.captureException(
          new Error('Invalid response data from server')
        );
        throw new Error('Invalid response data from server');
      }

      const validUser: TelegramUser = {
        ...userResult.data,
        username: userResult.data.username || null,
        photo_url: userResult.data.photo_url || null,
        bot_name: userResult.data.bot_name || '',
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('telegram_user', JSON.stringify(validUser));
      }

      setUser(validUser);
      setError(null);
      toast.success('Successfully logged in!', { icon: '✅' });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Login failed');
      setError(err);
      errorTracker.captureException(error);
      toast.error(err.message, { icon: '❌' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setIsLoading(true);
    setError(null);

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('telegram_user');
      }
      setUser(null);
      toast.success('Successfully logged out', { icon: '👋' });
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Logout failed');
      setError(err);
      errorTracker.captureException(error);
      toast.error(err.message, { icon: '❌' });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authContextValue = useMemo(
    () => ({
      user,
      login,
      logout,
      isLoading,
      error,
    }),
    [user, login, logout, isLoading, error]
  );

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Viewport Provider Component
const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isMobile = useMediaQuery({ maxWidth: 639 });
  const isTablet = useMediaQuery({ minWidth: 640, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1279 });
  const isLargeDesktop = useMediaQuery({ minWidth: 1280 });

  const viewportContextValue = useMemo(
    () => ({
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
    }),
    [isMobile, isTablet, isDesktop, isLargeDesktop]
  );

  return (
    <ViewportContext.Provider value={viewportContextValue}>
      {children}
    </ViewportContext.Provider>
  );
};

// Theme Provider Component
const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle('dark', e.matches);
      };

      document.documentElement.classList.toggle('dark', mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } catch (error) {
      errorTracker.captureException(error);
    }
  }, []);

  return <>{children}</>;
};

// Main Providers Component
const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  // Memoize QueryClient to prevent unnecessary re-renders
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
          mutations: {
            onError: (error: unknown) => {
              errorTracker.captureException(error);
              toast.error('An error occurred. Please try again later.');
            },
          },
        },
      }),
    []
  );

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ViewportProvider>
          <AuthProvider>{children}</AuthProvider>
        </ViewportProvider>
      </ThemeProvider>
      {env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
};

export default React.memo(Providers);
