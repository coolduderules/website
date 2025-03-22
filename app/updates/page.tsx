'use client';

import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const updates = [
  {
    id: 1,
    title: 'Enhanced Signal Accuracy',
    date: '2024-03-15',
    description:
      "We've improved our signal generation algorithms to provide even more accurate trading opportunities.",
    category: 'Technical',
  },
  {
    id: 2,
    title: 'New Community Features',
    date: '2024-03-10',
    description:
      'Added new community engagement features including real-time discussions and expert Q&A sessions.',
    category: 'Community',
  },
  {
    id: 3,
    title: 'Market Analysis Tools',
    date: '2024-03-05',
    description:
      'Launched new market analysis tools to help you make better trading decisions.',
    category: 'Features',
  },
];

export default function Updates() {
  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient">
              Latest Updates
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Stay informed about our latest improvements and new features.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-8">
            {updates.map(update => (
              <motion.div
                key={update.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 rounded-xl p-6 shadow-soft hover:shadow-hover transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {update.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
                      {update.category}
                    </span>
                    <time
                      className="text-sm text-gray-500"
                      dateTime={update.date}
                    >
                      {new Date(update.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                </div>
                <p className="text-gray-600">{update.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="text-center">
            <p className="text-sm text-gray-500">
              Want to suggest a feature?{' '}
              <a
                href="/contact"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                Let us know
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
