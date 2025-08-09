import * as Sentry from "@sentry/nextjs";

export async function register() {
  // Only initialize Sentry if DSN is provided
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  
  if (!dsn) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Sentry] No DSN provided, skipping Sentry initialization');
    }
    return;
  }

  // Determine environment
  const environment = process.env.NODE_ENV || 'development';
  const isProduction = environment === 'production';
  
  // Base configuration shared across all environments
  const baseConfig = {
    dsn,
    environment,
    // Higher sample rate in development for testing, lower in production for performance
    tracesSampleRate: isProduction ? 0.1 : 1.0,
    
    // Filter out development errors to prevent noise in Sentry dashboard
    beforeSend(event: Sentry.ErrorEvent) {
      if (environment === 'development') {
        return null;
      }
      return event;
    },
  };

  // Detect runtime environment and initialize accordingly
  if (typeof window !== 'undefined') {
    // Client-side initialization
    Sentry.init({
      ...baseConfig,
      
      // Client-specific configuration for session replay
      replaysSessionSampleRate: 0.1, // Capture 10% of sessions
      replaysOnErrorSampleRate: 1.0,  // Capture 100% of sessions with errors
      
      integrations: [
        Sentry.replayIntegration({
          // Privacy settings for session replay
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
    });
    
    if (environment === 'development') {
      console.log('[Sentry] Client-side initialization complete');
    }
  } else {
    // Server-side initialization (covers both Node.js server and Edge runtime)
    Sentry.init(baseConfig);
    
    if (environment === 'development') {
      console.log('[Sentry] Server-side initialization complete');
    }
  }
}