import { GET } from '../../../app/api/reviews/route';
import { getTelegramChannelMessages } from '../../../app/api/utils/telegram';

// Mock telegram utility
jest.mock('../../../app/api/utils/telegram');

describe('Reviews API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns reviews from Telegram channel', async () => {
    const mockMessages = [
      {
        message_id: 1,
        date: 1234567890,
        text: 'Test message',
        entities: [{ type: 'text', offset: 0, length: 12 }],
      },
    ];

    (getTelegramChannelMessages as jest.Mock).mockResolvedValueOnce(
      mockMessages
    );

    const request = new Request('http://localhost:3000/api/reviews');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockMessages);
  });

  it('handles errors gracefully', async () => {
    (getTelegramChannelMessages as jest.Mock).mockRejectedValueOnce(
      new Error('API Error')
    );

    const request = new Request('http://localhost:3000/api/reviews');
    const response = await GET(request);

    expect(response.status).toBe(500);
  });
});
