'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { TelegramAuthResponse, TelegramUser } from '@/types/telegram';
import { errorTracker } from '@/utils/errorTracking';
import { env } from '@/utils/env';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface TelegramLoginProps {
  onAuth: (user: TelegramUser) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  showAvatar?: boolean;
  cornerRadius?: number;
  requestAccess?: boolean;
}

declare global {
  interface Window {
    onTelegramAuth: (response: {
      user: TelegramAuthResponse;
      html: string;
      origin: string;
    }) => void;
    Telegram?: {
      Login?: {
        auth: (options: {
          bot_id: string;
          request_access?: boolean;
          embed?: HTMLElement;
          callback: (response: {
            user: TelegramAuthResponse;
            html: string;
            origin: string;
          }) => void;
        }) => void;
      };
    };
  }
}

const buttonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export default function TelegramLogin({
  onAuth,
  buttonSize = 'large',
  showAvatar = true,
  cornerRadius = 8,
  requestAccess = true,
}: TelegramLoginProps) {
  const router = useRouter();
  const { user, login, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTelegramResponse = useCallback(
    async (response: {
      user: TelegramAuthResponse;
      html: string;
      origin: string;
    }) => {
      console.log('Received Telegram response:', response);
      setIsLoading(true);
      setError(null);
      try {
        const userData = response.user;
        await login(userData);
        toast.success('Welcome! Successfully logged in.');
        setError(null); // Clear any existing errors
        router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.';
        toast.error(errorMessage);
        setError(errorMessage);
        errorTracker.captureException(error);
      } finally {
        setIsLoading(false);
      }
    },
    [login, router]
  );

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      toast.success('Successfully logged out');
      router.refresh(); // Force a refresh after logout
    } catch (error) {
      toast.error('Logout failed');
      errorTracker.captureException(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Create Telegram Login widget on component mount
  useEffect(() => {
    const BOT_ID = env.TELEGRAM_BOT_ID;

    if (!BOT_ID) {
      console.error('Telegram Bot ID not configured');
      return;
    }

    // Load Telegram script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', BOT_ID);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', requestAccess.toString());
    script.setAttribute('data-userpic', showAvatar.toString());
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.async = true;

    // Define callback in global scope
    window.onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    // Append script to container
    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      // Cleanup
      if (containerRef.current) {
        const scripts = containerRef.current.getElementsByTagName('script');
        if (scripts.length > 0) {
          containerRef.current.removeChild(scripts[0]);
        }
      }
      delete window.onTelegramAuth;
    };
  }, [buttonSize, cornerRadius, onAuth, requestAccess, showAvatar]);

  // Function to manually trigger Telegram login
  const handleLoginClick = useCallback(() => {
    console.log('Login button clicked');

    if (isLoading) {
      console.log('Login is already in progress, ignoring click');
      return;
    }

    setError(null); // Clear any previous errors
    setIsLoading(true); // Set loading state when opening popup

    // First check if Telegram Login is available
    if (!window.Telegram || !window.Telegram.Login) {
      console.error('Telegram Login API not available', {
        telegramObject: !!window.Telegram,
        loginObject: window.Telegram ? !!window.Telegram.Login : false,
      });
      const errorMessage = 'Telegram login is not available. Please try again.';
      toast.error(errorMessage);
      errorTracker.captureMessage(errorMessage, 'medium');
      setIsLoading(false);
      return;
    }

    if (!env.TELEGRAM_BOT_ID) {
      console.error('Missing BOT_ID environment variable');
      const errorMessage = 'Bot configuration error';
      toast.error(errorMessage);
      errorTracker.captureMessage(errorMessage, 'high');
      setIsLoading(false);
      return;
    }

    console.log(
      'Initiating Telegram Login auth with BOT_ID:',
      env.TELEGRAM_BOT_ID
    );

    try {
      // Use the Telegram Login API to trigger the login prompt
      window.Telegram.Login.auth({
        bot_id: env.TELEGRAM_BOT_ID,
        request_access: true,
        callback: response => {
          console.log('Telegram auth callback received', response);
          handleTelegramResponse(response);
        },
      });
    } catch (err) {
      console.error('Telegram auth error:', err);
      errorTracker.captureException(err);
      toast.error('Failed to initialize Telegram login');
      setIsLoading(false);
    }
  }, [handleTelegramResponse, isLoading]);

  if (user) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="flex items-center gap-2 sm:gap-4"
      >
        <motion.div
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="flex items-center gap-2 sm:gap-4 group"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="relative">
            {user.photo_url ? (
              <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-primary-200 transition-all duration-200">
                <Image
                  src={user.photo_url}
                  alt={user.first_name}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary-100 ring-2 ring-transparent group-hover:ring-primary-200 transition-all duration-200 flex items-center justify-center">
                <span className="text-lg font-semibold text-primary-600">
                  {user.first_name[0]}
                </span>
              </div>
            )}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 right-0 w-48 p-2 glass rounded-lg shadow-hover"
                >
                  <div className="text-sm font-medium">{user.first_name}</div>
                  {user.username && (
                    <div className="text-xs text-gray-500">
                      @{user.username}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.button
          onClick={handleLogout}
          disabled={isLoading}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className="h-8 px-3 text-sm font-medium text-white bg-error-500 hover:bg-error-600 
            rounded-lg shadow-sm hover:shadow-md focus-ring
            disabled:opacity-50 disabled:pointer-events-none transition-all duration-200
            flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Logging out...</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="sm:block hidden">Logout</span>
            </>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center flex-col gap-2">
      <motion.button
        onClick={handleLoginClick}
        whileHover="hover"
        whileTap="tap"
        variants={buttonVariants}
        disabled={isLoading || !scriptLoaded}
        className="h-9 px-4 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600
          rounded-lg shadow-sm hover:shadow-md focus-ring
          disabled:opacity-50 disabled:pointer-events-none transition-all duration-200
          flex items-center gap-2"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.36-.63-.21-1.12-.32-1.08-.67.02-.18.27-.36.74-.54 2.92-1.27 4.86-2.1 5.83-2.5 2.78-1.14 3.35-1.34 3.73-1.34.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
        </svg>
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <span className="sm:block hidden">Sign in with Telegram</span>
            <span className="sm:hidden">Sign in</span>
          </>
        )}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-error-500 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
