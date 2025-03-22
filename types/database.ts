/** @format */

import { D1Database } from '@cloudflare/workers-types';

export interface Database {
  messages: Message[];
  users: User[];
}

export interface Message {
  id: number;
  user_id: number;
  text: string;
  created_at: string;
}

export interface User {
  id: number;
  telegram_id: number;
  username?: string;
  first_name: string;
  photo_url?: string;
  created_at: string;
}

export interface DatabaseEnv {
  DB: D1Database;
}

export const createInitialSchema = async (db: D1Database) => {
  await db.batch([
    db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER UNIQUE NOT NULL,
        username TEXT,
        first_name TEXT NOT NULL,
        photo_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `),
    db.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        text TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `),
  ]);
};
