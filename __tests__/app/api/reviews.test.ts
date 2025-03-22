import { NextResponse } from 'next/server';
import { GET } from '../../../app/api/reviews/route';
import { fetchTelegramChannelMessages } from '../../../app/api/utils/telegram';

// Mock the Next.js NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      data,
      ...options,
    })),
  },
}));

// Mock the telegram utility
jest.mock('../../../app/api/utils/telegram', () => ({
  fetchTelegramChannelMessages: jest.fn(),
}));

describe('Reviews API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return messages when fetch is successful', async () => {
    // Arrange
    const mockMessages = [
      { id: 1, text: 'Great service!' },
      { id: 2, text: 'Excellent app!' },
    ];
    (fetchTelegramChannelMessages as jest.Mock).mockResolvedValueOnce(
      mockMessages
    );

    // Act
    const response = await GET();

    // Assert
    expect(fetchTelegramChannelMessages).toHaveBeenCalled();
    expect(NextResponse.json).toHaveBeenCalledWith(mockMessages);
    expect(response).toEqual({ data: mockMessages });
  });

  it('should return error response when fetch fails', async () => {
    // Arrange
    const error = new Error('Failed to fetch');
    (fetchTelegramChannelMessages as jest.Mock).mockRejectedValueOnce(error);

    // Spy on console.error to verify it's called with the error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Act
    const response = await GET();

    // Assert
    expect(fetchTelegramChannelMessages).toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching reviews:',
      error
    );
    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
    expect(response).toEqual({
      data: { error: 'Failed to fetch reviews' },
      status: 500,
    });

    // Clean up
    consoleErrorSpy.mockRestore();
  });
});
