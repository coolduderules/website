'use client';

import { useState, useEffect, useRef } from 'react';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { TelegramChannelMessage } from '@/types/telegram';
import { getTelegramChannelMessages } from '@/utils/telegram';

export default function Reviews() {
  const [reviews, setReviews] = useState<TelegramChannelMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAutoScrolling = useRef(false);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const messages = await getTelegramChannelMessages();
        setReviews(messages);
      } catch (err) {
        setError('Failed to load messages. Please try again later.');
        console.error('Error loading messages:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReviews();
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current || reviews.length === 0) return;

    const container = scrollContainerRef.current;
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || isAutoScrolling.current) return;

          const scrollPosition = container.scrollTop + container.clientHeight;
          const totalHeight = container.scrollHeight;

          if (scrollPosition > (totalHeight * 2) / 3) {
            isAutoScrolling.current = true;
            container.scrollTop = totalHeight / 3;
            setTimeout(() => {
              isAutoScrolling.current = false;
            }, 100);
          } else if (scrollPosition < totalHeight / 3) {
            isAutoScrolling.current = true;
            container.scrollTop = (totalHeight * 2) / 3;
            setTimeout(() => {
              isAutoScrolling.current = false;
            }, 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [reviews]);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Community Messages</h1>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-6">
            {error}
          </div>
        )}

        <div
          ref={scrollContainerRef}
          className="space-y-6 h-[600px] overflow-y-auto custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {reviews.map(review => (
              <motion.div
                key={`${review.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-xl shadow-soft p-6 transition-shadow duration-200"
                role="article"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-50 flex items-center justify-center">
                      {review.from.photo_url ? (
                        <Image
                          src={review.from.photo_url}
                          alt=""
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg
                          className="w-6 h-6 text-primary-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">
                      {review.from.name}
                    </h2>
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {review.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
