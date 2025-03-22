/** @format */

import { D1Database } from '@cloudflare/workers-types';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'edge';

const errorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export async function POST(
  request: NextRequest,
  { env }: { env: { DB: D1Database } }
) {
  try {
    const data = await request.json();
    const validatedData = errorSchema.parse(data);

    // Store in D1
    await env.DB.prepare(
      `
      INSERT INTO errors (message, stack, context, timestamp, severity)
      VALUES (?, ?, ?, ?, ?)
    `
    )
      .bind(
        validatedData.message,
        validatedData.stack ?? null,
        JSON.stringify(validatedData.context ?? {}),
        new Date(validatedData.timestamp).toISOString(),
        validatedData.severity
      )
      .run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging error:', error);
    return NextResponse.json({ error: 'Failed to log error' }, { status: 500 });
  }
}
