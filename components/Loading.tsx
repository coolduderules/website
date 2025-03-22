'use client';

import React from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
  delay?: number; // Delay in ms before showing the loader
  spinnerSize?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export default function Loading({
  message = 'Loading...',
  fullscreen = false,
  delay = 0,
  spinnerSize = 'md',
  color = 'primary',
}: LoadingProps) {
  const [show, setShow] = React.useState(delay === 0);

  // Only show loading indicator after delay to prevent flashing for quick operations
  React.useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
    return () => {
      // Cleanup if needed
    };
  }, [delay]);

  if (!show) return null;

  const containerClass = fullscreen
    ? 'fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center'
    : 'flex items-center justify-center min-h-[200px]';

  return (
    <div
      className={containerClass}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col items-center gap-4"
      >
        <LoadingSpinner size={spinnerSize} color={color} />

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            {message}
            <span className="sr-only">Please wait while content loads</span>
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
