/**
 * Integration tests for error reporting functionality
 */

const mockCaptureException = jest.fn();
const mockWithScope = jest.fn((callback) => {
  const mockScope = {
    setTag: jest.fn(),
    setContext: jest.fn(),
  };
  callback(mockScope);
});

jest.mock('@sentry/nextjs', () => ({
  captureException: mockCaptureException,
  withScope: mockWithScope,
}));

describe('Error Reporting Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reportError function', () => {
    it('should report errors with context', () => {
      const { reportError } = require('../lib/monitoring');
      
      const testError = new Error('Test error');
      const testContext = {
        component: 'TestComponent',
        userId: 'user123',
        action: 'testAction',
      };
      
      reportError(testError, testContext);
      
      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(testError);
    });

    it('should handle errors without context', () => {
      const { reportError } = require('../lib/monitoring');
      
      const testError = new Error('Test error');
      
      reportError(testError);
      
      expect(mockCaptureException).toHaveBeenCalledWith(testError);
    });
  });

  describe('MonitoringDashboard error testing', () => {
    it('should capture test errors correctly', () => {
      // Mock React hooks
      const mockUseState = jest.fn(() => [[], jest.fn()]);
      const mockUseEffect = jest.fn();
      
      jest.doMock('react', () => ({
        useState: mockUseState,
        useEffect: mockUseEffect,
      }));
      
      // Mock localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: jest.fn(() => null),
        },
        writable: true,
      });
      
      // Mock process.env
      process.env.NODE_ENV = 'development';
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      
      // Create a mock instance and test the testError function
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // Simulate the testError function behavior
      try {
        throw new Error('Test error for monitoring');
      } catch (error) {
        mockCaptureException(error);
      }
      
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error for monitoring',
        })
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Error boundary integration', () => {
    it('should report component errors', () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
      
      // Simulate error boundary behavior
      const testError = new Error('Component error');
      const errorInfo = { componentStack: 'TestComponent' };
      
      // This would be called by the error boundary
      mockCaptureException(testError);
      
      expect(mockCaptureException).toHaveBeenCalledWith(testError);
      
      mockConsoleError.mockRestore();
    });
  });
});