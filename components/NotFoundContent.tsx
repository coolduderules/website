'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

export default function NotFoundContent() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient mb-4">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-500 rounded-lg shadow-sm hover:bg-primary-600 focus-ring transition-colors duration-200"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    </PageTransition>
  );
}
