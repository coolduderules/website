'use client';

import * as React from 'react';
import {
  motion,
  AnimatePresence,
  LazyMotion,
  domAnimation,
} from 'framer-motion';
import { usePathname } from 'next/navigation';
import { memo } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.33, 1, 0.68, 1],
      when: 'beforeChildren',
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.2,
      ease: [0.33, 1, 0.68, 1],
    },
  },
};

const PageTransition = memo(({ children }: PageTransitionProps) => {
  const pathname = usePathname();
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.focus();
    }
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [pathname]);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial="initial"
          animate="enter"
          exit="exit"
          variants={pageVariants}
          className="relative"
        >
          <div
            ref={mainContentRef}
            tabIndex={-1}
            className="outline-none"
            aria-live="polite"
            role="region"
            aria-label="Page content"
          >
            {children}
          </div>
          <motion.div
            className="fixed inset-x-0 bottom-0 h-screen z-50 pointer-events-none bg-gradient-to-t from-background to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </AnimatePresence>
    </LazyMotion>
  );
});

PageTransition.displayName = 'PageTransition';

export default PageTransition;
