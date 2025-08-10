# Implementation Plan

- [x] 1. Create modern instrumentation hook



  - Create `instrumentation.ts` file in project root with unified Sentry initialization
  - Implement environment detection and configuration logic
  - Add proper TypeScript types and error handling
  - _Requirements: 2.1, 2.2, 5.3_

- [x] 2. Migrate server-side Sentry configuration





  - Extract server configuration from `sentry.server.config.js`
  - Implement server-side initialization in instrumentation hook
  - Add development mode error filtering with `beforeSend` hook
  - Configure performance monitoring with environment-specific sample rates
  - _Requirements: 2.2, 3.1, 4.1, 5.1_

- [x] 3. Migrate edge runtime Sentry configuration





  - Extract edge configuration from `sentry.edge.config.js`
  - Implement edge runtime initialization in instrumentation hook
  - Configure performance monitoring for edge environment
  - _Requirements: 2.2, 3.1, 4.1_

- [x] 4. Migrate client-side Sentry configuration





  - Extract client configuration from `sentry.client.config.js`
  - Implement client-side initialization in instrumentation hook
  - Preserve replay integration settings (session recording)
  - Maintain development mode filtering and error handling
  - _Requirements: 2.2, 3.1, 4.1, 5.1_

- [x] 5. Update Next.js configuration





  - Remove deprecated `sentry` property from `next.config.js`
  - Move build options to `sentryBuildOptions` parameter in `withSentryConfig()`
  - Preserve existing webpack plugin options and environment variables
  - Maintain image optimization and other Next.js settings
  - _Requirements: 2.1, 2.3, 1.4_

- [x] 6. Configure environment variables


  - Add missing `NEXT_PUBLIC_SENTRY_DSN` to `.env.local` if needed
  - Document required environment variables for different environments
  - Implement graceful degradation when environment variables are missing
  - _Requirements: 5.2, 5.4, 3.2_

- [x] 7. Remove legacy configuration files


  - Delete `sentry.server.config.js` file
  - Delete `sentry.edge.config.js` file  
  - Delete `sentry.client.config.js` file
  - Verify no references to old config files remain in codebase
  - _Requirements: 2.4, 1.4_

- [x] 8. Test development server functionality


  - Start development server with `npm run dev`
  - Verify server starts without crashing and remains running
  - Confirm localhost:3000 is accessible and loads application
  - Validate no deprecated Sentry configuration warnings appear
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 9. Test error monitoring functionality


  - Test error capture using monitoring dashboard "Test Error" button
  - Verify errors are properly filtered in development mode
  - Confirm error reporting works correctly in production mode
  - Validate Sentry dashboard receives error reports when DSN is configured
  - _Requirements: 3.1, 3.2, 3.4_

- [x] 10. Test performance monitoring integration


  - Verify performance monitoring initializes correctly on application load
  - Test Core Web Vitals collection and Sentry tagging
  - Confirm monitoring dashboard shows performance data
  - Validate performance metrics are reported to Sentry properly
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 11. Validate environment configuration


  - Test application behavior in development mode with proper Sentry config
  - Verify graceful degradation when `NEXT_PUBLIC_SENTRY_DSN` is missing
  - Test production build process with source map upload configuration
  - Confirm environment-specific Sentry behavior works correctly
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 12. Create comprehensive tests




  - Write unit tests for instrumentation hook initialization
  - Create integration tests for error reporting functionality
  - Add tests for environment variable handling and graceful degradation
  - Test monitoring dashboard integration with new configuration
  - _Requirements: 3.3, 4.3, 5.2_