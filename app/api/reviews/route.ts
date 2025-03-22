import { NextResponse } from 'next/server';
import { getTelegramChannelMessages } from '../utils/telegram';
import { errorTracker } from '@/utils/errorTracking';
import { z } from 'zod';

// Use edge runtime for better performance
export const runtime = 'edge';

// Define response schema for consistent type validation
const reviewsResponseSchema = z.array(
  z.object({
    message_id: z.number(),
    date: z.number(),
    text: z.string(),
    formatted_date: z.string().optional(),
    entities: z
      .array(
        z.object({
          type: z.string(),
          offset: z.number(),
          length: z.number(),
        })
      )
      .optional(),
  })
);

// Cache control constants
const CACHE_MAX_AGE = 15 * 60; // 15 minutes in seconds

export async function GET(request: Request) {
  try {
    // Parse limit from request
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    // Validate limit
    if (isNaN(limit) || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid limit parameter. Must be between 1 and 50.' },
        { status: 400 }
      );
    }

    // Fetch and format messages
    const messages = await getTelegramChannelMessages(limit);

    // Add formatted dates for easier consumption by clients
    const formattedMessages = messages.map(msg => ({
      ...msg,
      formatted_date: new Date(msg.date * 1000).toISOString(),
    }));

    // Validate response against schema
    const validated = reviewsResponseSchema.safeParse(formattedMessages);
    if (!validated.success) {
      throw new Error('Invalid response format from Telegram API');
    }

    // Return response with cache headers
    return NextResponse.json(validated.data, {
      status: 200,
      headers: {
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}, s-maxage=${CACHE_MAX_AGE * 2}`,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    // Log error with detailed context
    errorTracker.captureException(error, {
      context: 'api/reviews',
      endpoint: '/api/reviews',
    });

    // Return appropriate error response
    return NextResponse.json(
      {
        error: 'Failed to fetch reviews',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
