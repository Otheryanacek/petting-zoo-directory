// Centralized monitoring utilities
import * as Sentry from '@sentry/nextjs';
import { event } from './analytics';

// Error reporting utilities
export const reportError = (error, context = {}) => {
  console.error('Error reported:', error, context);
  
  Sentry.withScope((scope) => {
    // Add context to the error
    Object.keys(context).forEach(key => {
      scope.setContext(key, context[key]);
    });
    
    Sentry.captureException(error);
  });

  // Track error in analytics
  event({
    action: 'error',
    category: 'Error',
    label: error.message || 'Unknown error',
  });
};

// User feedback collection
export const captureUserFeedback = (user, feedback) => {
  Sentry.captureUserFeedback({
    event_id: Sentry.lastEventId(),
    name: user.name,
    email: user.email,
    comments: feedback,
  });
};

// Set user context for better error tracking
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
  });
};

// Add breadcrumbs for user actions
export const addBreadcrumb = (message, category = 'user', data = {}) => {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
};

// Track business metrics
export const trackBusinessMetric = (metric, value, tags = {}) => {
  Sentry.addBreadcrumb({
    message: `Business Metric: ${metric}`,
    category: 'business',
    data: { metric, value, ...tags },
    level: 'info',
  });

  event({
    action: 'business_metric',
    category: 'Business',
    label: metric,
    value: value,
  });
};

// API error handling wrapper
export const withErrorHandling = (fn, context = {}) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      reportError(error, {
        function: fn.name,
        arguments: args,
        ...context,
      });
      throw error;
    }
  };
};

// Component error boundary helper
export const withErrorBoundary = (Component, fallback) => {
  return (props) => {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};