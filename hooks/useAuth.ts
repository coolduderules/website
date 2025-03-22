/** @format */
import { useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '@/components/Providers';
import { TelegramUser, TelegramAuthData } from '@/types/telegram';
import { errorTracker } from '@/utils/errorTracking';

export interface UseAuthReturn {
  // Core authentication state
  user: TelegramUser | null;
  login: (userData: TelegramAuthData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: Error | null;

  // Derived authentication state
  isAuthenticated: boolean;
  isAdmin: boolean;

  // Utility functions
  getAuthHeader: () => Record<string, string>;
  getProfileImageUrl: () => string;
}

/**
 * Custom hook for authentication functionality
 * Must be used within components wrapped by the Providers component
 */
export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext);

  if (!context) {
    const error = new Error(
      'useAuth must be used within an AuthProvider. ' +
        'Ensure this hook is called within a component wrapped by the Providers component.'
    );

    errorTracker.captureException(error);

    throw error;
  }

  // Derived authentication state with memoization
  const isAuthenticated = useMemo(() => !!context.user, [context.user]);

  // Check if user has admin role
  const isAdmin = useMemo(() => {
    if (!context.user) return false;

    // Define admin user IDs
    const adminIds = [
      123456789, // Replace with actual admin IDs
      987654321,
    ];

    return adminIds.includes(context.user.id);
  }, [context.user]);

  // Helper to generate authentication headers for API requests
  const getAuthHeader = useCallback(() => {
    if (!context.user) {
      return {};
    }

    return {
      'X-Telegram-Auth': `${context.user.id}:${context.user.hash}`,
    };
  }, [context.user]);

  // Helper to get user profile image with fallback
  const getProfileImageUrl = useCallback(() => {
    if (!context.user || !context.user.photo_url) {
      // Return default avatar
      return '/default-avatar.png';
    }

    return context.user.photo_url;
  }, [context.user]);

  return {
    // Core authentication functionality from context
    user: context.user,
    login: context.login,
    logout: context.logout,
    isLoading: context.isLoading,
    error: context.error,

    // Additional derived values and utilities
    isAuthenticated,
    isAdmin,
    getAuthHeader,
    getProfileImageUrl,
  };
};

/**
 * Type guard to validate if an unknown value is a TelegramUser object
 */
export const isTelegramUser = (value: unknown): value is TelegramUser => {
  if (!value || typeof value !== 'object') return false;

  const user = value as Partial<TelegramUser>;

  return (
    typeof user.id === 'number' &&
    typeof user.first_name === 'string' &&
    typeof user.auth_date === 'number' &&
    typeof user.hash === 'string' &&
    (user.username === undefined ||
      user.username === null ||
      typeof user.username === 'string') &&
    (user.photo_url === undefined ||
      user.photo_url === null ||
      typeof user.photo_url === 'string')
  );
};

/**
 * Validate that a Telegram auth response is not expired
 */
export const isAuthValid = (user: TelegramUser): boolean => {
  if (!user) return false;

  // Check if the auth_date is within the past 24 hours
  const now = Math.floor(Date.now() / 1000);
  const authTimestamp = user.auth_date;
  const MAX_AUTH_AGE = 24 * 60 * 60; // 24 hours in seconds

  return now - authTimestamp < MAX_AUTH_AGE;
};
