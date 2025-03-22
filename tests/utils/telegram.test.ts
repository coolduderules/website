import { getTelegramChannelMessages } from '@/utils/telegram';

describe('Telegram Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  describe('getTelegramChannelMessages', () => {
    it('fetches and processes messages correctly', async () => {
      const mockMessages = [
        {
          message_id: 1,
          date: Date.now(),
          text: 'Test message',
          entities: [{ type: 'text', offset: 0, length: 12 }],
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true, result: mockMessages }),
      });

      const messages = await getTelegramChannelMessages();
      expect(messages?.[0]?.text).toBe('Test message');
    });

    it('handles API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: false, description: 'API Error' }),
      });

      const messages = await getTelegramChannelMessages();
      expect(messages).toEqual([]);
    });

    it('handles network errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const messages = await getTelegramChannelMessages();
      expect(messages).toEqual([]);
    });
  });
});
