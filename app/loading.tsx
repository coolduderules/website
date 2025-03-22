'use client';

import { motion } from 'framer-motion';
import LoadingSpinner from '@/components/LoadingSpinner';

const loadingVariants = {
  initial: {
    opacity: 0,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 1, 1],
    },
  },
};

export default function RootLoading() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        variants={loadingVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative"
      >
        <div className="flex flex-col items-center gap-6">
          <LoadingSpinner size="lg" />

          <div className="text-center space-y-2">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg font-medium text-gradient"
            >
              Loading content
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              Just a moment...
            </motion.div>
          </div>

          <motion.div
            className="w-48 h-1 bg-primary-100 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div
              className="h-full bg-primary-500 rounded-full"
              animate={{
                x: ['0%', '100%'],
                scaleX: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
