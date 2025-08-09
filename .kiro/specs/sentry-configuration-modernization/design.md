# Design Document

## Overview

This design modernizes the Sentry integration for the petting zoo directory application from the deprecated configuration approach to the current Next.js 13+ and Sentry 8.x standards. The solution migrates from separate config files to the instrumentation hook pattern while maintaining all existing monitoring capabilities.

## Architecture

### Current State Analysis
- **Sentry Version**: `@sentry/nextjs` 8.55.0 (current)
- **Next.js Version**: 13.5.6
- **Configuration Pattern**: Legacy separate config files (deprecated)
- **Issue**: Using deprecated `sentry` property in `next.config.js`

### Target Architecture
- **Configuration Pattern**: Modern instrumentation hook approach
- **File Structure**: Single `instrumentation.ts` file for all Sentry initialization
- **Build Configuration**: `sentryBuildOptions` parameter in `withSentryConfig()`
- **Environment Handling**: Proper development vs production configuration

## Components and Interfaces

### 1. Instrumentation Hook (`instrumentation.ts`)
**Purpose**: Central Sentry initialization for all runtime environments

**Interface**:
```typescript
export async function register(): Promise<void>
```

**Responsibilities**:
- Initialize Sentry for server, edge, and client environments
- Configure environment-specific settings
- Handle graceful degradation when DSN is missing
- Set up performance monitoring and error tracking

### 2. Updated Next.js Configuration (`next.config.js`)
**Purpose**: Modern Sentry build-time configuration

**Changes**:
- Remove deprecated `sentry` property
- Move build options to `sentryBuildOptions` parameter
- Maintain existing webpack plugin configuration
- Preserve image optimization and other settings

### 3. Environment Configuration
**Purpose**: Proper environment variable handling

**Variables**:
- `NEXT_PUBLIC_SENTRY_DSN`: Client-side error reporting endpoint
- `SENTRY_ORG`: Organization for source map uploads
- `SENTRY_PROJECT`: Project identifier for source map uploads
- `SENTRY_AUTH_TOKEN`: Authentication for build-time operations

### 4. Monitoring Dashboard Integration
**Purpose**: Maintain existing monitoring capabilities

**Requirements**:
- Preserve current error testing functionality
- Maintain performance monitoring integration
- Keep development mode visibility controls

## Data Models

### Sentry Configuration Schema
```typescript
interface SentryConfig {
  dsn?: string;
  tracesSampleRate: number;
  environment: 'development' | 'production' | 'staging';
  beforeSend?: (event: Event) => Event | null;
  integrations?: Integration[];
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
}
```

### Build Options Schema
```typescript
interface SentryBuildOptions {
  org?: string;
  project?: string;
  authToken?: string;
  silent: boolean;
  hideSourceMaps: boolean;
  disableLogger: boolean;
}
```

## Error Handling

### 1. Missing DSN Handling
- **Scenario**: `NEXT_PUBLIC_SENTRY_DSN` not configured
- **Behavior**: Sentry initialization skipped, no errors thrown
- **Logging**: Console warning in development mode

### 2. Build-time Configuration Errors
- **Scenario**: Missing `SENTRY_ORG` or `SENTRY_PROJECT`
- **Behavior**: Source map upload skipped, build continues
- **Logging**: Warning message about missing configuration

### 3. Runtime Initialization Errors
- **Scenario**: Network issues or invalid DSN
- **Behavior**: Graceful degradation, application continues
- **Logging**: Error logged but not propagated

### 4. Development Mode Filtering
- **Scenario**: Errors in development environment
- **Behavior**: Filtered out by `beforeSend` hook
- **Purpose**: Prevent noise in Sentry dashboard

## Testing Strategy

### 1. Unit Testing
- **Instrumentation Hook**: Test initialization with various environment configurations
- **Error Filtering**: Verify development mode error filtering
- **Configuration Validation**: Test handling of missing environment variables

### 2. Integration Testing
- **Development Server**: Verify server starts and remains running
- **Error Reporting**: Test error capture and reporting functionality
- **Performance Monitoring**: Validate performance metrics collection
- **Monitoring Dashboard**: Test dashboard functionality with new configuration

### 3. Environment Testing
- **Development**: Verify local development server stability
- **Production Build**: Test production build process with source maps
- **Environment Variables**: Test behavior with various environment configurations

### 4. Migration Testing
- **Configuration Migration**: Verify old config files can be safely removed
- **Functionality Preservation**: Ensure all existing monitoring features work
- **Performance Impact**: Verify no performance regression

## Implementation Phases

### Phase 1: Create Modern Configuration
1. Create `instrumentation.ts` with unified Sentry initialization
2. Update `next.config.js` to use `sentryBuildOptions`
3. Configure environment-specific behavior

### Phase 2: Migrate Existing Configuration
1. Consolidate server, edge, and client configurations
2. Preserve existing integration settings (replay, performance monitoring)
3. Maintain development mode filtering

### Phase 3: Clean Up Legacy Files
1. Remove deprecated config files (`sentry.server.config.js`, etc.)
2. Update any references to old configuration approach
3. Verify no orphaned configuration remains

### Phase 4: Testing and Validation
1. Test development server stability
2. Validate error reporting functionality
3. Verify monitoring dashboard integration
4. Test production build process

## Migration Strategy

### Backward Compatibility
- Maintain all existing monitoring capabilities
- Preserve environment-specific behavior
- Keep existing integration configurations

### Risk Mitigation
- Implement changes incrementally
- Test each phase thoroughly before proceeding
- Maintain rollback capability by preserving old files initially

### Validation Criteria
- Development server starts and remains stable
- No deprecated configuration warnings
- All monitoring features functional
- Performance monitoring operational
- Error reporting working correctly