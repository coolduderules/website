import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
  className?: string;
}

const sizes = {
  sm: 'w-6 h-6 border-2',
  md: 'w-10 h-10 border-3',
  lg: 'w-16 h-16 border-4',
};

const colors = {
  primary: 'border-primary-100 border-t-primary-500',
  secondary: 'border-secondary-100 border-t-secondary-500',
  white: 'border-white/30 border-t-white',
};

export default function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  // Extract the border color for the spinner track
  const trackColor = colors[color].split(' ')[0];
  // Extract the border color for the spinner indicator
  const indicatorColor = colors[color].split(' ')[1];

  React.useEffect(() => {
    // Any cleanup needed when component unmounts
    return () => {};
  }, []);

  return (
    <div
      className={`relative inline-block ${className}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-busy={true}
    >
      {/* Static track */}
      <div className={`${sizes[size]} rounded-full ${trackColor} opacity-30`} />

      {/* Animated spinner */}
      <motion.div
        className={`${sizes[size]} rounded-full border-t-transparent absolute top-0 left-0`}
        style={{
          borderColor: 'transparent',
          borderTopColor: 'currentColor',
          borderStyle: 'solid',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
        // Use will-change for better performance
        initial={{ willChange: 'transform' }}
      />
    </div>
  );
}
