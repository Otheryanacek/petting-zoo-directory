/**
 * Tests for instrumentation hook initialization
 */

// Mock Sentry before importing
const mockSentryInit = jest.fn();
const mockSentryReplayIntegration = jest.fn(() => 'replay-integration');

jest.mock('@sentry/nextjs', () => ({
  init: mockSentryInit,
  replayIntegration: mockSentryReplayIntegration,
}));

describe('Instrumentation Hook', () => {
  let originalEnv;
  let originalWindow;

  beforeEach(() => {
    // Save original environment
    originalEnv = process.env;
    originalWindow = global.window;
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Reset environment
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    delete process.env.NODE_ENV;
    delete process.env.NEXT_RUNTIME;
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    global.window = originalWindow;
  });

  describe('DSN validation', () => {
    it('should skip initialization when DSN is missing', async () => {
      // Import and run register function
      const { register } = require('../instrumentation.ts');
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await register();
      
      expect(mockSentryInit).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('[Sentry] No DSN provided, skipping Sentry initialization');
      
      consoleSpy.mockRestore();
    });

    it('should initialize when DSN is provided', async () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      process.env.NODE_ENV = 'development';
      
      // Mock server-side environment
      global.window = undefined;
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: 'https://test@sentry.io/123',
          environment: 'development',
        })
      );
    });
  });

  describe('Environment detection', () => {
    beforeEach(() => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
    });

    it('should configure for client-side environment', async () => {
      process.env.NODE_ENV = 'development';
      global.window = {}; // Mock client-side environment
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 1.0, // Development rate
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
          integrations: expect.arrayContaining(['replay-integration']),
        })
      );
    });

    it('should configure for edge runtime environment', async () => {
      process.env.NODE_ENV = 'production';
      process.env.NEXT_RUNTIME = 'edge';
      global.window = undefined;
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1, // Production rate
        })
      );
    });

    it('should configure for server-side environment', async () => {
      process.env.NODE_ENV = 'production';
      global.window = undefined;
      delete process.env.NEXT_RUNTIME;
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      expect(mockSentryInit).toHaveBeenCalledWith(
        expect.objectContaining({
          tracesSampleRate: 0.1, // Production rate
        })
      );
    });
  });

  describe('Development mode filtering', () => {
    it('should filter out development errors', async () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      process.env.NODE_ENV = 'development';
      global.window = undefined;
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      const initCall = mockSentryInit.mock.calls[0][0];
      const beforeSend = initCall.beforeSend;
      
      // Test that development errors are filtered out
      const result = beforeSend({ message: 'Test error' });
      expect(result).toBeNull();
    });

    it('should allow production errors', async () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      process.env.NODE_ENV = 'production';
      global.window = undefined;
      
      const { register } = require('../instrumentation.ts');
      await register();
      
      const initCall = mockSentryInit.mock.calls[0][0];
      const beforeSend = initCall.beforeSend;
      
      // Test that production errors are allowed
      const testEvent = { message: 'Test error' };
      const result = beforeSend(testEvent);
      expect(result).toBe(testEvent);
    });
  });
});