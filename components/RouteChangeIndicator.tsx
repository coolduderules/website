'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import nprogress from 'nprogress';

export default function RouteChangeIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    nprogress.start();
    const timeout = setTimeout(() => nprogress.done(), 300);
    return () => {
      clearTimeout(timeout);
      nprogress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
