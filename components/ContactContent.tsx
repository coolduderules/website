'use client';

import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import { env } from '@/utils/env';

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

export default function ContactContent() {
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
              Get in Touch
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Have questions? We&apos;re here to help you with anything you
              need.
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <motion.a
              href={`https://t.me/${env.TELEGRAM_BOT_NAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-6 bg-white/50 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Telegram Support
                  </h3>
                  <p className="text-gray-600">
                    Get help directly through our Telegram channel
                  </p>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="mailto:support@stiflingchip.com"
              className="block p-6 bg-white/50 rounded-xl shadow-soft hover:shadow-hover transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 text-primary-600 flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Email Support
                  </h3>
                  <p className="text-gray-600">
                    Send us an email for any inquiries
                  </p>
                </div>
              </div>
            </motion.a>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/50 rounded-xl p-8 shadow-soft"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {[
                {
                  question: 'How do I join the community?',
                  answer:
                    'Click the Telegram link above to join our community channel where you&apos;ll get access to all our services and support.',
                },
                {
                  question: 'What kind of support do you provide?',
                  answer:
                    'We offer technical support, trading guidance, and community assistance through both Telegram and email channels.',
                },
                {
                  question: 'How quickly can I expect a response?',
                  answer:
                    'We typically respond within 24 hours, but for urgent matters, Telegram support is usually faster.',
                },
              ].map(faq => (
                <div key={faq.question}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
