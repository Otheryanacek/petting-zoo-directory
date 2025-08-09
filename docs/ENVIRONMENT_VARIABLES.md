# Environment Variables

This document describes the required environment variables for different environments.

## Sentry Configuration

### Required for Error Monitoring
- `NEXT_PUBLIC_SENTRY_DSN`: Your Sentry Data Source Name (DSN) for error reporting
  - Format: `https://your-key@sentry.io/project-id`
  - Required for: All environments where error monitoring is needed
  - Graceful degradation: Application works without it, but no error reporting

### Required for Source Map Upload (Production)
- `SENTRY_ORG`: Your Sentry organization slug
  - Required for: Production builds with source map upload
  - Example: `my-organization`

- `SENTRY_PROJECT`: Your Sentry project slug
  - Required for: Production builds with source map upload
  - Example: `my-nextjs-app`

### Optional
- `CI`: Set to any truthy value in CI environments
  - Controls logging verbosity during build
  - Default: `false` (verbose logging in development)

## Other Environment Variables

### Sanity CMS
- `NEXT_PUBLIC_SANITY_PROJECT_ID`: Sanity project identifier
- `NEXT_PUBLIC_SANITY_DATASET`: Sanity dataset name (usually 'production')

### Analytics
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `NEXT_PUBLIC_GA_ID`: Google Analytics tracking ID

## Environment-Specific Behavior

### Development
- Sentry errors are filtered to reduce noise
- Source maps are not uploaded
- Verbose logging is enabled

### Production
- All errors are reported to Sentry
- Source maps are uploaded for better debugging
- Logging is minimized

## Graceful Degradation

The application is designed to work even when Sentry environment variables are missing:
- Missing `NEXT_PUBLIC_SENTRY_DSN`: No error reporting, but app functions normally
- Missing `SENTRY_ORG` or `SENTRY_PROJECT`: Source maps won't be uploaded, but app builds successfully