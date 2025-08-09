# Monitoring and Analytics Setup

This document explains how to set up and configure monitoring and analytics for the Petting Zoo Directory application.

## Overview

The application includes three main monitoring components:

1. **Sentry** - Error tracking and performance monitoring
2. **Google Analytics 4** - User behavior tracking and analytics
3. **Core Web Vitals** - Performance monitoring

## Setup Instructions

### 1. Sentry Setup

1. Create a Sentry account at [sentry.io](https://sentry.io)
2. Create a new project for your application
3. Copy the DSN from your project settings
4. Add the DSN to your environment variables:
   ```
   NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
   ```

Optional: For source map uploads, add these variables:
```
SENTRY_ORG=your_sentry_org
SENTRY_PROJECT=your_sentry_project
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 2. Google Analytics Setup

1. Create a Google Analytics 4 property at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID (starts with G-)
3. Add it to your environment variables:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

## Features

### Error Tracking

- Automatic error capture with Sentry
- Custom error reporting with context
- Error boundaries for graceful error handling
- User feedback collection

### Performance Monitoring

- Core Web Vitals tracking (CLS, FID, FCP, LCP, TTFB)
- Custom performance metrics
- API response time tracking
- Image loading performance

### Analytics

- Page view tracking
- Custom event tracking for:
  - Zoo views
  - Search queries
  - Filter usage
  - Map interactions
  - Review submissions

### Development Tools

- Monitoring dashboard (visible in development)
- Test buttons for error and analytics
- Environment status indicators

## Usage Examples

### Custom Error Reporting

```javascript
import { reportError } from '../lib/monitoring';

try {
  // Some operation that might fail
} catch (error) {
  reportError(error, {
    component: 'ZooCard',
    zooId: zoo._id,
    action: 'loadZooData'
  });
}
```

### Custom Analytics Events

```javascript
import { trackZooView, trackSearch } from '../lib/analytics';

// Track when a user views a zoo
trackZooView(zoo.name, zoo._id);

// Track search queries
trackSearch(searchTerm, results.length);
```

### Performance Tracking

```javascript
import { trackCustomPerformance } from '../lib/performance';

const startTime = performance.now();
// ... some operation
const endTime = performance.now();

trackCustomPerformance('zoo_data_load', startTime, endTime, {
  zooCount: zoos.length
});
```

## Monitoring Dashboard

In development mode, a monitoring dashboard appears in the bottom-right corner with:

- Status indicators for Sentry and GA
- Test buttons for error and analytics
- Environment information

## Production Considerations

### Sentry

- Adjust `tracesSampleRate` for production (recommended: 0.1)
- Enable source maps upload for better error tracking
- Set up alerts for critical errors

### Google Analytics

- Only loads in production environment
- Respects user privacy settings
- Tracks Core Web Vitals automatically

### Performance

- Monitor Core Web Vitals regularly
- Set up alerts for performance degradation
- Use performance data to optimize user experience

## Troubleshooting

### Sentry Not Working

1. Check that `NEXT_PUBLIC_SENTRY_DSN` is set correctly
2. Verify the DSN format (should start with `https://`)
3. Check browser console for Sentry initialization errors

### Google Analytics Not Tracking

1. Verify `NEXT_PUBLIC_GA_ID` is set correctly
2. Check that the ID starts with `G-`
3. Ensure you're testing in production mode (`npm run build && npm start`)

### Performance Monitoring Issues

1. Check browser support for `web-vitals` library
2. Verify that performance API is available
3. Check console for any JavaScript errors

## Data Privacy

- All monitoring respects user privacy
- No personally identifiable information is tracked
- Users can opt out of analytics if needed
- Error reports are sanitized to remove sensitive data

## Maintenance

- Regularly review error reports in Sentry
- Monitor performance trends in Google Analytics
- Update monitoring configurations as needed
- Clean up old error data periodically