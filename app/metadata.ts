import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "Stifling Chip's Crypto Corner",
  description:
    'Join our community for expert crypto trading insights, real-time market analysis, and exclusive trading signals.',
  keywords: [
    'crypto',
    'trading',
    'cryptocurrency',
    'market analysis',
    'trading signals',
    'community',
  ],
  authors: [{ name: 'Stifling Chip' }],
  manifest: '/manifest.json',
  appleWebApp: {
    title: "Stifling Chip's Crypto Corner",
    statusBarStyle: 'default',
    capable: true,
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: [{ url: '/Logo.svg', sizes: '1024x1024' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 2,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0095ff' },
    { media: '(prefers-color-scheme: dark)', color: '#004c91' },
  ],
};
