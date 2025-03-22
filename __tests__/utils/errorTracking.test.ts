/** @format */

import { errorTracker } from '@/utils/errorTracking';

// Mock the fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ErrorTracker', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should capture errors with correct severity', async () => {
    const error = new Error('Test error');
    await errorTracker.captureException(error, 'high');

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/log-error'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: expect.stringContaining('"severity":"high"'),
      })
    );
  });

  it('should handle API errors gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Test error');

    await errorTracker.captureException(error);

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should capture messages with metadata', async () => {
    const metadata = { userId: '123', action: 'test' };
    await errorTracker.captureMessage('Test message', 'medium', metadata);

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/log-error'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"metadata":'),
      })
    );
  });

  it('should respect rate limiting', async () => {
    // Simulate multiple rapid error captures
    for (let i = 0; i < 10; i++) {
      await errorTracker.captureException(new Error(`Error ${i}`));
    }

    // Should have called fetch fewer times than attempts due to rate limiting
    expect(mockFetch.mock.calls.length).toBeLessThan(10);
  });

  it('should enforce rate limiting correctly', async () => {
    jest.useFakeTimers();
    const error = new Error('Test error');

    // First error should go through
    await errorTracker.captureException(error);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second error within rate limit window should be blocked
    await errorTracker.captureException(error);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Advance time past rate limit window
    jest.advanceTimersByTime(60000);

    // New error should now go through
    await errorTracker.captureException(error);
    expect(mockFetch).toHaveBeenCalledTimes(2);

    jest.useRealTimers();
  });

  it('should group similar errors', async () => {
    const error1 = new Error('Connection failed');
    const error2 = new Error('Connection failed');
    const error3 = new Error('Different error');

    await errorTracker.captureException(error1);
    await errorTracker.captureException(error2);
    await errorTracker.captureException(error3);

    // Should have grouped the two connection errors
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
