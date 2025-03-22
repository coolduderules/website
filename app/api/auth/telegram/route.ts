/** @format */
import { NextResponse } from 'next/server';
import { TelegramAuthResponse } from '@/types/telegram';
import { errorTracker } from '@/utils/errorTracking';
import { DatabaseEnv } from '@/types/database';
import { env } from '@/utils/env';
import { z } from 'zod';

// Use edge runtime for better performance
export const runtime = 'edge';

// Comprehensive schema for Telegram auth data validation
const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string(),
  auth_date: z.number(),
  hash: z.string(),
  username: z.string().optional().nullable(),
  photo_url: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
});

/**
 * Rate limiting for authentication attempts
 * This Map stores IP addresses and their attempt counts
 */
const authAttempts = new Map<string, { count: number; firstAttempt: number }>();
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

/**
 * Validate Telegram authentication data using HMAC-SHA256
 */
async function checkTelegramAuthorization(
  data: TelegramAuthResponse
): Promise<boolean> {
  const botToken = env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    errorTracker.captureMessage(
      'Missing BOT_TOKEN in environment',
      'critical',
      {
        service: 'telegram-auth',
      }
    );
    return false;
  }

  const { hash, ...rest } = data;
  if (!hash || !rest.id || !rest.first_name || !rest.auth_date) {
    return false;
  }

  // Check if auth_date is not older than 24h
  const authDate = parseInt(rest.auth_date.toString());
  if (isNaN(authDate) || Date.now() / 1000 - authDate > 86400) {
    return false;
  }

  // Sort fields alphabetically and create data check string
  type TelegramDataKeys = keyof Omit<TelegramAuthResponse, 'hash'>;
  const dataCheckString = (Object.keys(rest) as TelegramDataKeys[])
    .sort()
    .map(k => `${k}=${rest[k]}`)
    .join('\n');

  try {
    // Use Web Crypto API for HMAC verification
    const encoder = new TextEncoder();
    const secretKeyData = await crypto.subtle.digest(
      'SHA-256',
      encoder.encode(botToken)
    );

    const key = await crypto.subtle.importKey(
      'raw',
      secretKeyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(dataCheckString)
    );

    // Convert to hex string
    const computedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return computedHash === hash;
  } catch (error) {
    errorTracker.captureException(error, {
      context: 'telegram-auth',
      function: 'checkTelegramAuthorization',
    });
    return false;
  }
}

/**
 * Check if an IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const attempt = authAttempts.get(ip);

  if (!attempt) {
    authAttempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  // Reset rate limit counter after window expires
  if (now - attempt.firstAttempt > RATE_LIMIT_WINDOW) {
    authAttempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  // Increment attempt count
  attempt.count++;

  // Check if rate limited
  if (attempt.count > MAX_ATTEMPTS) {
    return true;
  }

  return false;
}

/**
 * Main auth handler
 */
export async function POST(req: Request, { DB }: DatabaseEnv) {
  try {
    // Extract client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    // Check for rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests', message: 'Please try again later' },
        {
          status: 429,
          headers: { 'Retry-After': '60' },
        }
      );
    }

    const rawData: unknown = await req.json();

    // Handle different data structures from Telegram login widget
    let processedData: unknown;
    if (
      rawData &&
      typeof rawData === 'object' &&
      rawData !== null &&
      'user' in rawData
    ) {
      processedData = (rawData as { user: unknown }).user;
    } else {
      processedData = rawData;
    }

    // Validate input schema
    const result = telegramAuthSchema.safeParse(processedData);
    if (!result.success) {
      errorTracker.captureMessage('Invalid Telegram auth schema', 'medium', {
        errors: result.error.format(),
      });

      return NextResponse.json(
        {
          error: 'Invalid input',
          details: 'The provided data does not match the required format',
        },
        { status: 400 }
      );
    }

    // Now data is properly typed thanks to Zod validation
    const data: TelegramAuthResponse = result.data;

    // Verify signature
    const isValid = await checkTelegramAuthorization(data);
    if (!isValid) {
      errorTracker.captureMessage(
        'Invalid Telegram authorization attempt',
        'high',
        {
          ip,
          userId: data.id,
          authDate: new Date(data.auth_date * 1000).toISOString(),
        }
      );

      return NextResponse.json(
        {
          error: 'Invalid authorization',
          message: 'Authentication check failed',
        },
        { status: 401 }
      );
    }

    // Store or update user in D1 database
    try {
      const { id: telegram_id, first_name, username, photo_url } = data;
      const lastLogin = Math.floor(Date.now() / 1000);

      await DB.prepare(
        `
        INSERT INTO users (telegram_id, first_name, username, photo_url, last_login)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(telegram_id) DO UPDATE SET
          first_name = excluded.first_name,
          username = excluded.username,
          photo_url = excluded.photo_url,
          last_login = excluded.last_login
      `
      )
        .bind(
          telegram_id,
          first_name,
          username || null,
          photo_url || null,
          lastLogin
        )
        .run();
    } catch (dbError) {
      errorTracker.captureException(dbError, {
        context: 'database',
        operation: 'update_user',
        telegramId: data.id,
      });
      // Continue even if DB operation fails - don't block authentication
    }

    // Return authenticated user data
    return NextResponse.json({
      ...data,
      bot_name: env.TELEGRAM_BOT_NAME,
    });
  } catch (error) {
    errorTracker.captureException(error, {
      context: 'telegram-auth',
      endpoint: '/api/auth/telegram',
    });

    return NextResponse.json(
      { error: 'Authentication failed', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
