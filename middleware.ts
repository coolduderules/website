/** @format */

import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/utils/env';

// Rate limiting with a simple token bucket algorithm
const rateLimits = new Map<string, { tokens: number; lastRefill: number }>();
const RATE_LIMIT_TOKENS = 50;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let bucket = rateLimits.get(ip);

  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_TOKENS, lastRefill: now };
    rateLimits.set(ip, bucket);
    return true;
  }

  const timePassed = now - bucket.lastRefill;
  const tokensToAdd =
    Math.floor(timePassed / RATE_LIMIT_WINDOW) * RATE_LIMIT_TOKENS;
  bucket.tokens = Math.min(RATE_LIMIT_TOKENS, bucket.tokens + tokensToAdd);
  bucket.lastRefill = now;

  if (bucket.tokens > 0) {
    bucket.tokens--;
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  // Rate limiting - Cloudflare adds cf-connecting-ip header or fallback to x-forwarded-for
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    'unknown';

  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (!checkRateLimit(ip)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }

  const response = NextResponse.next();

  // Essential security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://telegram.org",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' https: data:",
      "connect-src 'self' https://api.telegram.org",
      "frame-src 'self' https://telegram.org",
    ].join('; ')
  );

  // Validate environment variables
  const missingVars = Object.entries(env).filter(([_, value]) => !value);
  if (missingVars.length > 0) {
    response.headers.set(
      'X-Environment-Warning',
      `Missing required environment variables: ${missingVars
        .map(([key]) => key)
        .join(', ')}`
    );
  }

  // CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set(
      'Access-Control-Allow-Origin',
      env.NEXT_PUBLIC_APP_URL
    );
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,DELETE,OPTIONS'
    );
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|favicon.ico|manifest.json|.*\\..*$).*)',
  ],
};
