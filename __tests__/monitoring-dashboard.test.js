/**
 * Tests for monitoring dashboard integration with new configuration
 */

import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Sentry
const mockCaptureException = jest.fn();
jest.mock('@sentry/nextjs', () => ({
  captureException: mockCaptureException,
}));

// Mock analytics
const mockEvent = jest.fn();
jest.mock('../lib/analytics', () => ({
  event: mockEvent,
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

describe('MonitoringDashboard Integration', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Visibility control', () => {
    it('should be visible in development mode', () => {
      process.env.NODE_ENV = 'development';
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText('🔍 Monitoring Dashboard')).toBeInTheDocument();
    });

    it('should be visible for admin users', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue('true');
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText('🔍 Monitoring Dashboard')).toBeInTheDocument();
    });

    it('should be hidden in production for non-admin users', () => {
      process.env.NODE_ENV = 'production';
      localStorageMock.getItem.mockReturnValue(null);
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      const { container } = render(<MonitoringDashboard />);
      
      expect(container.firstChild).toBeNull();
    });
  });

  describe('Test Error functionality', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should capture errors when Test Error button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      const testErrorButton = screen.getByText('Test Error');
      fireEvent.click(testErrorButton);
      
      expect(mockCaptureException).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error for monitoring',
        })
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        'Test error captured:',
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Test Analytics functionality', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should send analytics events when Test Analytics button is clicked', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      const testAnalyticsButton = screen.getByText('Test Analytics');
      fireEvent.click(testAnalyticsButton);
      
      expect(mockEvent).toHaveBeenCalledWith({
        action: 'test_event',
        category: 'Testing',
        label: 'Monitoring Dashboard Test',
        value: 1,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Test analytics event sent');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Environment status indicators', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should show correct Sentry status when DSN is configured', () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://test@sentry.io/123';
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText(/Sentry: ✅/)).toBeInTheDocument();
    });

    it('should show correct Sentry status when DSN is missing', () => {
      delete process.env.NEXT_PUBLIC_SENTRY_DSN;
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText(/Sentry: ❌/)).toBeInTheDocument();
    });

    it('should show correct GA status when ID is configured', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'G-XXXXXXXXXX';
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText(/GA: ✅/)).toBeInTheDocument();
    });

    it('should show current environment', () => {
      process.env.NODE_ENV = 'development';
      
      const MonitoringDashboard = require('../components/MonitoringDashboard').default;
      render(<MonitoringDashboard />);
      
      expect(screen.getByText(/Environment: development/)).toBeInTheDocument();
    });
  });
});