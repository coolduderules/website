import { TelegramUser } from '@/types/telegram';
import jest from 'jest';

export const mockTelegramUser: TelegramUser = {
  id: 123456789,
  first_name: 'Test',
  auth_date: Math.floor(Date.now() / 1000),
  hash: 'test_hash',
  username: 'testuser',
  photo_url: null,
};

export const mockFetch = (responseData = {}, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(responseData),
    headers: new Headers(),
  });
};

export const mockLocalStorage = () => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

export const waitForNextTick = () =>
  new Promise(resolve => setTimeout(resolve, 0));
