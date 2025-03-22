import { z } from 'zod';
import { env } from '@/utils/env';
import { errorTracker } from '@/utils/errorTracking';
import crypto from 'crypto';

// Enhanced validation schema with stricter types
const telegramAuthSchema = z.object({
  id: z.number().int().positive(),
  first_name: z.string().min(1),
  username: z.string().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
  auth_date: z.number().int().positive(),
  hash: z.string().length(64),
});

export type TelegramAuthData = z.infer<typeof telegramAuthSchema>;

// Extend with initial duration of 1 hour, can be configured
const AUTH_EXPIRY_TIME = 3600 * 1000; // 1 hour in milliseconds

/**
 * Validates Telegram authentication data using the Web Crypto API
 * This function is usable in edge runtime environments
 */
export async function checkTelegramAuthorization(
  authData: unknown
): Promise<TelegramAuthData> {
  try {
    // Validate input data structure
    const validationResult = telegramAuthSchema.safeParse(authData);

    if (!validationResult.success) {
      throw new Error(`Invalid auth data: ${validationResult.error.message}`);
    }

    const validatedData = validationResult.data;
    const { hash, ...data } = validatedData;

    // Validate auth_date is not expired
    const authDate = new Date(data.auth_date * 1000);
    const now = new Date();
    if (now.getTime() - authDate.getTime() > AUTH_EXPIRY_TIME) {
      throw new Error('Authorization expired');
    }

    // Sort object keys alphabetically for consistent check string
    const checkArray = Object.entries(data)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`);

    const checkString = checkArray.join('\n');

    // Get the bot token (fail fast if not available)
    const botToken = env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN is not configured');
    }

    // Generate secret key using Web Crypto API for edge compatibility
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
      encoder.encode(checkString)
    );

    // Convert to hex string
    const computedHash = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare computed hash with provided hash
    if (computedHash !== hash) {
      throw new Error('Invalid authorization signature');
    }

    return validatedData;
  } catch (error) {
    // Log the error with context but without sensitive data
    errorTracker.captureException(error, {
      context: 'telegram-auth-validation',
      authDate:
        authData && typeof authData === 'object' && 'auth_date' in authData
          ? authData.auth_date
          : 'invalid',
    });

    throw error;
  }
}

// Enhanced message schema for strong typing
const telegramMessageSchema = z.object({
  message_id: z.number().int().positive(),
  date: z.number().int().positive(),
  text: z.string(),
  entities: z
    .array(
      z.object({
        type: z.string(),
        offset: z.number(),
        length: z.number(),
      })
    )
    .optional(),
});

export type TelegramMessage = z.infer<typeof telegramMessageSchema>;

// Cache for telegram messages to reduce API calls
let messageCache: {
  messages: TelegramMessage[];
  timestamp: number;
  expiresAt: number;
} | null = null;

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Fetch messages from a Telegram channel
 * Uses caching to reduce API calls and handles rate limiting
 */
export async function getTelegramChannelMessages(
  limit = 10
): Promise<TelegramMessage[]> {
  try {
    // Check cache first
    const now = Date.now();
    if (
      messageCache &&
      now < messageCache.expiresAt &&
      messageCache.messages.length >= limit
    ) {
      return messageCache.messages.slice(0, limit);
    }

    // Get required environment variables
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const channelId = env.TELEGRAM_CHANNEL_ID;

    if (!botToken || !channelId) {
      throw new Error('Missing required Telegram API configuration');
    }

    // Make API call with abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?chat_id=${channelId}&limit=${limit + 10}`, // Request extra messages to account for filtering
      {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Telegram API error: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    if (!data.ok) {
      throw new Error(
        `Telegram API returned error: ${data.description || 'Unknown error'}`
      );
    }

    // Filter to only include actual messages with text
    const validMessages = (data.result || [])
      .filter((update: any) => update.message?.text)
      .map((update: any) => update.message)
      .slice(0, limit);

    // Parse and validate each message
    const parsedMessages = validMessages
      .map((msg: unknown) => {
        const parseResult = telegramMessageSchema.safeParse(msg);
        if (!parseResult.success) {
          errorTracker.captureMessage(
            'Invalid message format from Telegram API',
            'medium',
            { errors: parseResult.error.format() }
          );
          return null;
        }
        return parseResult.data;
      })
      .filter(
        (msg: TelegramMessage | null): msg is TelegramMessage => msg !== null
      );

    // Update cache
    messageCache = {
      messages: parsedMessages,
      timestamp: now,
      expiresAt: now + CACHE_TTL,
    };

    return parsedMessages;
  } catch (error) {
    // Handle and log errors
    errorTracker.captureException(error, {
      context: 'telegram-messages',
      limit,
      function: 'getTelegramChannelMessages',
    });

    // Return cached data if available, even if expired
    if (messageCache?.messages) {
      return messageCache.messages.slice(0, limit);
    }

    throw error;
  }
}

// Re-export types for convenience
export type { TelegramUser } from '@/types/telegram';
