/** @format */
import { z } from 'zod';

// Define schema for all environment variables used in the application
const envSchema = z.object({
  // Telegram-related variables - all optional since they're only needed for certain features
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_BOT_NAME: z.string().optional(),
  TELEGRAM_BOT_ID: z.string().optional(),
  TELEGRAM_CHANNEL_ID: z.string().optional(),
  REVIEW_CHANNEL: z.string().optional(),
  NEXT_PUBLIC_TELEGRAM_BOT_ID: z.string().optional(),
  
  // Application URLs and deployment
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal('')),
  
  // Build and runtime environment indicators
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PHASE: z.string().optional(),
  CI: z.union([z.string(), z.boolean()]).optional(),
  
  // Build tools and analysis
  ANALYZE: z.string().optional(),

  // Cloudflare-specific
  CF_PAGES: z.union([z.string(), z.boolean()]).optional(),
});

/**
 * Gets environment variables with proper typing and validation
 * Works in all environments: local dev, build time, and runtime on Cloudflare
 */
function getEnvVariables() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined';

  // For browser environment, we can only access NEXT_PUBLIC_* variables
  // All sensitive variables should NOT be included in client-side code
  if (isBrowser) {
    const clientEnv = {
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
      NEXT_PUBLIC_TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '',
      NODE_ENV: process.env.NODE_ENV || 'development',
      
      // These will be undefined in the browser, which is correct for security
      TELEGRAM_BOT_TOKEN: undefined,
      TELEGRAM_BOT_NAME: undefined, 
      TELEGRAM_BOT_ID: undefined,
      TELEGRAM_CHANNEL_ID: undefined,
      REVIEW_CHANNEL: undefined,
      NEXT_PHASE: undefined,
      CI: undefined,
      ANALYZE: undefined,
      CF_PAGES: undefined,
    };
    
    const result = envSchema.safeParse(clientEnv);
    if (!result.success) {
      console.error(
        '❌ Invalid client-side environment variables:',
        JSON.stringify(result.error.format(), null, 2)
      );
      return envSchema.parse(clientEnv); // Will throw with better error
    }
    return result.data;
  }

  // Server-side environment: we can access all variables
  const env = {
    // Telegram-related variables
    TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
    TELEGRAM_BOT_NAME: process.env.TELEGRAM_BOT_NAME,
    TELEGRAM_BOT_ID: process.env.TELEGRAM_BOT_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    REVIEW_CHANNEL: process.env.REVIEW_CHANNEL,
    
    // Application URLs and deployment
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || '',
    NEXT_PUBLIC_TELEGRAM_BOT_ID: process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || '',
    
    // Build and runtime environment indicators
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PHASE: process.env.NEXT_PHASE,
    CI: process.env.CI,
    
    // Build tools and analysis
    ANALYZE: process.env.ANALYZE,

    // Cloudflare-specific
    CF_PAGES: process.env.CF_PAGES,
  };

  const result = envSchema.safeParse(env);
  if (!result.success) {
    console.error(
      '❌ Invalid server-side environment variables:',
      JSON.stringify(result.error.format(), null, 2)
    );
    
    // In development, show detailed error
    if (env.NODE_ENV === 'development') {
      throw new Error(`Invalid environment variables: ${JSON.stringify(result.error.format(), null, 2)}`);
    }
    
    // In production, log error but don't expose details
    throw new Error('Invalid environment variables configuration');
  }
  return result.data;
}

export const env = getEnvVariables();
