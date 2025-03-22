'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TouchEventWithForce extends TouchEvent {
  readonly force?: number;
}

type KeyMapping = {
  key: string;
  action: () => void;
  description: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
};

export default function KeyboardNavigation() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
        return;
      }

      const keyMappings: KeyMapping[] = [
        {
          key: 'h',
          action: () => router.push('/'),
          description: 'Go to Home',
        },
        {
          key: 'a',
          action: () => router.push('/about'),
          description: 'Go to About',
        },
        {
          key: 'r',
          action: () => router.push('/reviews'),
          description: 'Go to Reviews',
        },
        {
          key: 'u',
          action: () => router.push('/updates'),
          description: 'Go to Updates',
        },
        {
          key: 'c',
          action: () => router.push('/contact'),
          description: 'Go to Contact',
        },
      ];

      const mapping = keyMappings.find(m => m.key === event.key.toLowerCase());

      if (mapping) {
        event.preventDefault();
        mapping.action();
      }
    },
    [router]
  );

  useEffect(() => {
    let touchTimer: NodeJS.Timeout;
    let touchCount = 0;

    function handleFirstTab(e: KeyboardEvent) {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleFirstTab);
        window.addEventListener('mousedown', handleMouseDownOnce);
        window.addEventListener('touchstart', handleTouchStart);
      }
    }

    function handleMouseDownOnce() {
      document.body.classList.remove('user-is-tabbing');
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleFirstTab);
    }

    function handleTouchStart() {
      touchCount++;

      // Double tap detection
      if (touchCount === 1) {
        touchTimer = setTimeout(() => {
          touchCount = 0;
        }, 300);
      } else if (touchCount === 2) {
        // Double tap detected - enable keyboard mode
        document.body.classList.add('user-is-tabbing');
        clearTimeout(touchTimer);
        touchCount = 0;
      }
    }

    function handleTouchMove() {
      // Reset touch count on scroll/move to prevent accidental triggers
      touchCount = 0;
      clearTimeout(touchTimer);
    }

    window.addEventListener('keydown', handleFirstTab);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('keydown', handleKeyDown);

    // Handle 3D Touch/Force Touch if available
    if ('ontouchforcechange' in window) {
      const handleTouchForce = (e: TouchEventWithForce) => {
        if (e.force && e.force > 0.5) {
          document.body.classList.add('user-is-tabbing');
        }
      };

      window.addEventListener(
        'touchforcechange',
        handleTouchForce as EventListener
      );
    }

    return () => {
      window.removeEventListener('keydown', handleFirstTab);
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(touchTimer);
    };
  }, [handleKeyDown]);

  return null;
}
