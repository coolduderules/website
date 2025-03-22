export interface TelegramAuthData {
  id: number;
  first_name: string;
  auth_date: number;
  hash: string;
  username?: string | null;
  photo_url?: string | null;
  last_name?: string | null;
}

export interface TelegramUser extends TelegramAuthData {
  bot_name?: string;
}

export interface TelegramChannelMessage {
  message_id: number;
  date: number;
  text?: string;
  entities?: Array<{
    type: string;
    offset: number;
    length: number;
  }>;
  from?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username?: string;
  };
}

export interface TelegramResponse<T> {
  ok: boolean;
  result: T;
  description?: string;
}

export type ErrorSeverity = 'low' | 'medium' | 'high';
