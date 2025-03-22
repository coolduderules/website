import React from 'react';

export const dynamic = 'force-static';
export const dynamicParams = false;

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gradient mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-primary-500 rounded-lg shadow-sm hover:bg-primary-600 focus-ring transition-colors duration-200"
        >
          Return Home
        </a>
      </div>
    </div>
  );
}
