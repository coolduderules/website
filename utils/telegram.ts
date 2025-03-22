import { TelegramChannelMessage, TelegramResponse } from '@/types/telegram';
import { errorTracker } from '@/utils/errorTracking';
import { env } from './env';
import { ReactNode } from 'react';

// Cache setup to reduce API calls
interface CacheEntry {
  data: TelegramChannelMessage[];
  timestamp: number;
  expiry: number;
}

const MESSAGE_CACHE: { [key: string]: CacheEntry } = {};
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function isTelegramResponse<T>(
  data: unknown
): data is TelegramResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'ok' in data &&
    typeof (data as TelegramResponse<T>).ok === 'boolean'
  );
}

export function validateMessageEntities(
  message: TelegramChannelMessage
): boolean {
  if (!message.text || !message.entities?.length) {
    return false;
  }

  const entities = [...message.entities].sort((a, b) => b.offset - a.offset);
  return entities.every(
    entity =>
      entity.offset >= 0 &&
      entity.length > 0 &&
      entity.offset + entity.length <= message.text!.length
  );
}

/**
 * Fetches Telegram channel messages from the API with caching and error handling
 *
 * @param lastMessageId ID of the last message to fetch from (optional)
 * @returns Array of Telegram messages or empty array if error occurs
 */
export async function getTelegramChannelMessages(
  lastMessageId?: number
): Promise<TelegramChannelMessage[]> {
  try {
    const channelId = env.TELEGRAM_CHANNEL_ID;
    const botToken = env.TELEGRAM_BOT_TOKEN;

    if (!channelId || !botToken) {
      throw new Error('Missing required Telegram configuration');
    }

    const params = new URLSearchParams({
      chat_id: channelId,
      ...(lastMessageId ? { offset_id: lastMessageId.toString() } : {}),
    });

    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/getUpdates?${params}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!isTelegramResponse<TelegramChannelMessage[]>(data)) {
      throw new Error('Invalid response format from Telegram API');
    }

    if (!data.ok) {
      throw new Error(
        `Telegram API returned error: ${data.description || 'Unknown error'}`
      );
    }

    return (data.result || [])
      .filter(message => validateMessageEntities(message))
      .sort((a, b) => b.date - a.date);
  } catch (error) {
    // Log error but don't crash the UI
    errorTracker.captureException(error, {
      context: 'telegram-client',
      function: 'getTelegramChannelMessages',
    });

    // Return cached data even if expired
    const cacheKey = `messages_${lastMessageId}`;
    if (MESSAGE_CACHE[cacheKey]) {
      return MESSAGE_CACHE[cacheKey].data;
    }

    // Return empty array as fallback
    return [];
  }
}

/**
 * Format Telegram message text by processing entities
 * For example, converting URLs, bold, italic etc.
 *
 * @param message The message to format
 * @returns Formatted HTML string
 */
export function formatTelegramMessage(message: TelegramChannelMessage): string {
  if (!message.text || !message.entities || !message.entities.length) {
    return message.text || '';
  }

  let formattedText = message.text;
  const entities = [...message.entities].sort((a, b) => b.offset - a.offset);

  for (const entity of entities) {
    const { type, offset, length } = entity;
    const text = message.text.substring(offset, offset + length);

    switch (type) {
      case 'bold':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<strong>${text}</strong>`
        );
        break;
      case 'italic':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<em>${text}</em>`
        );
        break;
      case 'underline':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<u>${text}</u>`
        );
        break;
      case 'code':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<code>${text}</code>`
        );
        break;
      case 'pre':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<pre>${text}</pre>`
        );
        break;
      case 'text_link':
        if (entity.url) {
          formattedText = replaceAt(
            formattedText,
            offset,
            length,
            `<a href="${entity.url}" target="_blank" rel="noopener noreferrer">${text}</a>`
          );
        }
        break;
      case 'url':
        formattedText = replaceAt(
          formattedText,
          offset,
          length,
          `<a href="${text}" target="_blank" rel="noopener noreferrer">${text}</a>`
        );
        break;
      // Add more entity types as needed
    }
  }

  return formattedText;
}

// Helper function to replace text at a specific position
function replaceAt(
  text: string,
  offset: number,
  length: number,
  replacement: string
): string {
  return (
    text.substring(0, offset) + replacement + text.substring(offset + length)
  );
}
