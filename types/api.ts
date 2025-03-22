/** @format */

import { z } from 'zod';
import { TelegramUser } from './telegram';

// Base API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Auth API types
export const authRequestSchema = z.object({
  user: z.custom<TelegramUser>(),
  hash: z.string(),
});

export type AuthRequest = z.infer<typeof authRequestSchema>;

// Reviews API types
export const reviewSchema = z.object({
  id: z.number(),
  userId: z.number(),
  text: z.string().min(1),
  rating: z.number().min(1).max(5),
  createdAt: z.string().datetime(),
});

export type Review = z.infer<typeof reviewSchema>;

export const createReviewSchema = reviewSchema.omit({
  id: true,
  createdAt: true,
});

// Error logging API types
export const errorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
  context: z.record(z.unknown()).optional(),
  timestamp: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export type ErrorLog = z.infer<typeof errorSchema>;
