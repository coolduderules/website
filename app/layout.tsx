import React from 'react';
import type { Metadata, Viewport } from 'next';
import { metadata as siteMetadata, viewport as siteViewport } from './metadata';
import './globals.css';

// Import directly instead of using dynamic imports to ensure proper hydration
import Providers from '@/components/Providers';
import ClientLayout from '@/components/ClientLayout';
import InitialLoading from '@/components/InitialLoading';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = siteMetadata;
export const viewport: Viewport = siteViewport;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers>
            <InitialLoading>
              <ClientLayout>{children}</ClientLayout>
            </InitialLoading>
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
