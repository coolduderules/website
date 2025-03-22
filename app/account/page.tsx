'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/PageTransition';
import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function Account() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-6"
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary-100">
              {user.photo_url ? (
                <Image
                  src={user.photo_url}
                  alt={user.first_name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <span className="text-3xl font-semibold text-primary-600">
                    {user.first_name[0]}
                  </span>
                </div>
              )}
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">
                {user.first_name}
              </h1>
              {user.username && (
                <p className="text-gray-500">@{user.username}</p>
              )}
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700">
                  Telegram Member
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/50 rounded-xl p-6 shadow-soft hover:shadow-hover transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Account Details
                </h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Member Since
                    </dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(user.auth_date * 1000).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Authentication Status
                    </dt>
                    <dd className="text-sm text-green-600 flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white/50 rounded-xl p-6 shadow-soft hover:shadow-hover transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Preferences
                </h3>
                <div className="space-y-4">
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus-ring transition-colors duration-200">
                    Manage Notifications
                  </button>
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus-ring transition-colors duration-200">
                    Privacy Settings
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="text-center text-sm text-gray-500"
          >
            <p>
              Need help? Contact support through our{' '}
              <a
                href="/contact"
                className="text-primary-600 hover:text-primary-700 hover:underline"
              >
                help center
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  );
}
