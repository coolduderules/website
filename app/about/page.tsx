'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

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

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
          About Stifling Chip
        </h1>
        <p className="mt-6 text-lg text-gray-600">
          Your trusted partner in cryptocurrency trading and market analysis. We
          provide expert insights, real-time updates, and a supportive community
          for traders.
        </p>
      </motion.div>
    </div>
  );
}
