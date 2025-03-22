import {
  checkTelegramAuthorization,
  getTelegramChannelMessages,
  type TelegramAuthData,
} from '@/app/api/utils/telegram';
import { mockFetch } from './test-utils';
import { validateTelegramHash } from '@/utils/telegram';

describe('Telegram Authentication', () => {
  const mockAuthData: TelegramAuthData = {
    id: 123456789,
    first_name: 'Test',
    username: 'testuser',
    auth_date: Math.floor(Date.now() / 1000),
    hash: 'mock-hash',
  };

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should validate recent auth data', async () => {
    const result = await checkTelegramAuthorization(mockAuthData);
    expect(result).toBeDefined();
    expect(result.id).toBe(mockAuthData.id);
  });

  it('should reject expired auth data', async () => {
    const expiredData = {
      ...mockAuthData,
      auth_date: Math.floor(Date.now() / 1000) - 7200, // 2 hours ago
    };

    await expect(checkTelegramAuthorization(expiredData)).rejects.toThrow(
      'Authorization expired'
    );
  });

  describe('Error Handling', () => {
    it('should handle malformed auth data', () => {
      const invalidData = {
        // Missing required fields
        hash: '1234',
        auth_date: Date.now(),
      };

      expect(() => validateTelegramHash(invalidData)).toThrow(
        'Invalid auth data'
      );
    });

    it('should reject expired auth attempts', () => {
      const expiredData = {
        id: '123456789',
        first_name: 'Test',
        username: 'test_user',
        photo_url: 'https://example.com/photo.jpg',
        auth_date: Math.floor(Date.now() / 1000) - 86500, // More than 24h old
        hash: 'valid_hash',
      };

      expect(() => validateTelegramHash(expiredData)).toThrow(
        'Auth data expired'
      );
    });

    it('should reject tampered data', () => {
      const tamperedData = {
        id: '123456789',
        first_name: 'Test',
        username: 'test_user',
        photo_url: 'https://example.com/photo.jpg',
        auth_date: Math.floor(Date.now() / 1000),
        hash: 'invalid_hash',
      };

      expect(() => validateTelegramHash(tamperedData)).toThrow('Invalid hash');
    });
  });
});

describe('getTelegramChannelMessages', () => {
  beforeEach(() => {
    global.fetch = mockFetch({
      ok: true,
      result: [
        {
          channel_post: {
            message_id: 1,
            date: Math.floor(Date.now() / 1000),
            text: 'Test message',
          },
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch channel messages successfully', async () => {
    const messages = await getTelegramChannelMessages(1);
    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe('Test message');
  });

  it('should handle API errors', async () => {
    global.fetch = mockFetch({}, false, 404);
    await expect(getTelegramChannelMessages()).rejects.toThrow(
      'Failed to fetch channel messages'
    );
  });

  it('should handle invalid responses', async () => {
    global.fetch = mockFetch({ ok: true, result: 'invalid' });
    await expect(getTelegramChannelMessages()).rejects.toThrow(
      'Invalid response from Telegram API'
    );
  });

  it('should respect the limit parameter', async () => {
    global.fetch = mockFetch({
      ok: true,
      result: Array(5)
        .fill(null)
        .map((_, i) => ({
          channel_post: {
            message_id: i + 1,
            date: Math.floor(Date.now() / 1000),
            text: `Message ${i + 1}`,
          },
        })),
    });

    const messages = await getTelegramChannelMessages(3);
    expect(messages).toHaveLength(3);
  });
});
