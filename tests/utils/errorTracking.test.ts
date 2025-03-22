import { errorTracker } from '@/utils/errorTracking';

describe('Error Tracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  it('captures exceptions with severity', async () => {
    const error = new Error('Test error');
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await errorTracker.captureException(error, { severity: 'high' });

    expect(global.fetch).toHaveBeenCalledWith('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"severity":"high"'),
    });
  });

  it('captures messages with context', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    await errorTracker.captureMessage(
      'Test message',
      { context: 'test' },
      'low'
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"message":"Test message"'),
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });

    await errorTracker.captureMessage('Test message');

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
