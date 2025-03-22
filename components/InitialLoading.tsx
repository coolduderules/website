'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';

interface InitialLoadingProps {
  children: React.ReactNode;
}

const loadingVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.15,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const InitialLoading = ({ children }: InitialLoadingProps) => {
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate minimum loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="loading"
            className="fixed inset-0 bg-gradient-to-br from-background to-primary-50/20 backdrop-blur-sm z-50 
              flex items-center justify-center p-4"
            role="status"
            aria-label="Application loading"
            variants={loadingVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col items-center">
              <motion.div variants={itemVariants}>
                <LoadingSpinner size="lg" />
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="text-center space-y-2">
                  <p className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-500">
                    Loading your experience
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we set things up
                  </p>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="mt-8 relative">
                <div className="w-48 h-1 bg-primary-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary-500 rounded-full"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: 'easeInOut',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
};

export default InitialLoading;
