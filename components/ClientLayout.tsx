'use client';

import * as React from 'react';
import RouteChangeIndicator from './RouteChangeIndicator';
import ScrollToTop from './ScrollToTop';
import KeyboardNavigation from './KeyboardNavigation';
import Navbar from './Navbar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <>
      <RouteChangeIndicator />
      <Navbar />
      <KeyboardNavigation />
      <ScrollToTop />
      {children}
    </>
  );
}
