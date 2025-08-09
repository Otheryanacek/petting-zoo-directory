// Performance monitoring utilities for Core Web Vitals

import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import { event } from './analytics';

// Send Core Web Vitals to Google Analytics
function sendToGoogleAnalytics({ name, delta, value, id }) {
  event({
    action: name,
    category: 'Web Vitals',
    label: id,
    value: Math.round(name === 'CLS' ? delta * 1000 : delta),
  });
}

// Send Core Web Vitals to Sentry
function sendToSentry({ name, delta, value, id }) {
  Sentry.addBreadcrumb({
    message: `Core Web Vital: ${name}`,
    category: 'performance',
    data: {
      name,
      delta,
      value,
      id,
    },
    level: 'info',
  });

  // Set performance metrics as tags for better filtering
  Sentry.setTag(`cwv.${name}`, Math.round(name === 'CLS' ? delta * 1000 : delta));
}

// Initialize Core Web Vitals tracking
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  const sendToAnalytics = (metric) => {
    sendToGoogleAnalytics(metric);
    sendToSentry(metric);
  };

  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// Custom performance tracking for specific operations
export function trackCustomPerformance(name, startTime, endTime, metadata = {}) {
  const duration = endTime - startTime;
  
  // Send to Google Analytics
  event({
    action: 'custom_performance',
    category: 'Performance',
    label: name,
    value: Math.round(duration),
  });

  // Send to Sentry
  Sentry.addBreadcrumb({
    message: `Custom Performance: ${name}`,
    category: 'performance',
    data: {
      name,
      duration,
      ...metadata,
    },
    level: 'info',
  });
}

// Track API response times
export function trackAPIPerformance(endpoint, method, duration, status) {
  const metric = {
    action: 'api_performance',
    category: 'API',
    label: `${method} ${endpoint}`,
    value: Math.round(duration),
  };

  event(metric);

  Sentry.addBreadcrumb({
    message: `API Performance: ${method} ${endpoint}`,
    category: 'api',
    data: {
      endpoint,
      method,
      duration,
      status,
    },
    level: status >= 400 ? 'error' : 'info',
  });
}

// Track image loading performance
export function trackImageLoadPerformance(src, loadTime) {
  event({
    action: 'image_load',
    category: 'Performance',
    label: src,
    value: Math.round(loadTime),
  });
}