# Safe Components Usage Guide

## Overview

The safe component wrappers provide robust error handling and graceful degradation for your React components. They automatically handle missing data, validation errors, and rendering failures while providing detailed error monitoring.

## Components

### 1. SafeImage

Replaces regular `<img>` tags and handles missing image data gracefully.

```jsx
import SafeImage from '../components/SafeImage'

// Basic usage
<SafeImage 
  image={zoo.mainImage}
  alt="Zoo image"
  width={400}
  height={250}
/>

// Advanced usage with custom fallbacks
<SafeImage 
  image={zoo.mainImage}
  identifier="main-image"
  alt="Zoo main image"
  width={400}
  height={250}
  fallbackText="Zoo image not available"
  fallbackIcon="🏞️"
  onError={(error, validationResult) => {
    console.log('Image failed to load:', error)
  }}
  style={{ borderRadius: '8px' }}
/>
```

**Features:**
- Validates image data using validation utilities
- Shows loading states
- Provides customizable fallback content
- Logs errors to monitoring system
- Handles image load failures gracefully

### 2. SafeLink

Replaces Next.js `Link` components and handles invalid slug/href data.

```jsx
import SafeLink from '../components/SafeLink'

// With slug validation
<SafeLink 
  slug={zoo.slug}
  basePath="/zoo"
  className="zoo-link"
>
  Visit Zoo
</SafeLink>

// With direct href
<SafeLink 
  href={zoo.website}
  className="external-link"
>
  Official Website
</SafeLink>

// With custom fallback
<SafeLink 
  slug={zoo.slug}
  basePath="/zoo"
  fallbackComponent={() => (
    <span className="disabled-link">Link unavailable</span>
  )}
>
  Visit Zoo
</SafeLink>
```

**Features:**
- Validates slug data before navigation
- Sanitizes URLs to prevent XSS attacks
- Handles both internal and external links
- Provides fallback rendering for invalid links
- Supports disabled state

### 3. SafeMap

Wraps map components to handle invalid location data and rendering errors.

```jsx
import SafeMap from '../components/SafeMap'

// Basic usage
<SafeMap pettingZoos={zoos} />

// Advanced usage with error handling
<SafeMap 
  pettingZoos={zoos}
  showErrorDetails={process.env.NODE_ENV === 'development'}
  retryAttempts={3}
  retryDelay={2000}
  onError={(error) => {
    console.error('Map error:', error)
    // Send to error tracking service
  }}
  fallbackComponent={({ error, onRetry }) => (
    <div className="custom-map-error">
      <h3>Map Unavailable</h3>
      <p>{error.message}</p>
      <button onClick={onRetry}>Try Again</button>
    </div>
  )}
/>
```

**Features:**
- Validates zoo location data
- Filters out invalid locations
- Provides retry mechanisms
- Shows user-friendly error messages
- Includes error boundary for crash protection

## Error Monitoring

### Automatic Error Logging

All safe components automatically log errors to the centralized monitoring system:

```jsx
import errorMonitor from '../utils/errorMonitoring'

// Get error statistics
const stats = errorMonitor.getErrorStats()
console.log('Total errors:', stats.totalErrors)
console.log('Errors by component:', stats.errorsByComponent)

// Get error trends
const trends = errorMonitor.getErrorTrends()
console.log('Recent error count:', trends.recentCount)
console.log('Trend:', trends.trend) // 'increasing', 'decreasing', or 'stable'
```

### Error Dashboard

In development mode, an error dashboard appears in the bottom-right corner showing:
- Total error count
- Errors by component
- Most common error types
- Recent error details
- Error trends

### Custom Error Handling

You can add custom error handlers to any safe component:

```jsx
<SafeImage 
  image={image}
  onError={(error, validationResult) => {
    // Custom error handling
    console.log('Image error:', error)
    
    // Send to external service
    analytics.track('image_load_failed', {
      imageId: image?.asset?._ref,
      errors: validationResult.errors
    })
  }}
/>
```

## Best Practices

### 1. Replace Existing Components Gradually

Start by replacing the most critical components first:

```jsx
// Before
<img src={urlFor(image)} alt="Zoo" />

// After
<SafeImage image={image} alt="Zoo" />
```

### 2. Use Appropriate Fallbacks

Provide meaningful fallback content:

```jsx
<SafeImage 
  image={zoo.mainImage}
  fallbackText={`${zoo.name} image not available`}
  fallbackIcon="🏞️"
/>
```

### 3. Monitor Errors in Production

Set up error monitoring for production:

```jsx
// In production, send errors to external service
if (process.env.NODE_ENV === 'production') {
  errorMonitor.sendToExternalService = (errorEntry) => {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorEntry)
    })
  }
}
```

### 4. Customize Error Messages

Provide user-friendly error messages:

```jsx
<SafeMap 
  pettingZoos={zoos}
  fallbackComponent={({ error }) => (
    <div className="map-error">
      <h3>Map Temporarily Unavailable</h3>
      <p>We're having trouble loading the map. Please try refreshing the page.</p>
      {process.env.NODE_ENV === 'development' && (
        <details>
          <summary>Technical Details</summary>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </details>
      )}
    </div>
  )}
/>
```

## Integration Checklist

- [ ] Replace `<img>` tags with `<SafeImage>`
- [ ] Replace `<Link>` components with `<SafeLink>`
- [ ] Replace map components with `<SafeMap>`
- [ ] Add error monitoring to critical pages
- [ ] Set up error dashboard for development
- [ ] Configure production error reporting
- [ ] Test error scenarios
- [ ] Document custom error handlers

## Error Types

The system tracks these error types:

- **image_load_failed**: Image failed to load or render
- **invalid_link_data**: Link has invalid slug or href data
- **map_rendering_failed**: Map component failed to render
- **validation_failed**: Data validation errors
- **network_error**: Network-related failures
- **timeout_error**: Request timeout errors

## Performance Impact

Safe components have minimal performance impact:
- Validation runs once per render
- Error logging is asynchronous
- Fallback rendering is lightweight
- Monitoring can be disabled in production

## Troubleshooting

### Common Issues

1. **Images not loading**: Check image asset references and Sanity configuration
2. **Links not working**: Verify slug data structure and validation rules
3. **Map not rendering**: Check Google Maps API key and location data
4. **Too many errors**: Review data quality and validation rules

### Debug Mode

Enable detailed logging in development:

```jsx
// Add to your app initialization
if (process.env.NODE_ENV === 'development') {
  window.errorMonitor = errorMonitor
  console.log('Error monitor available at window.errorMonitor')
}
```

Then in browser console:
```javascript
// View all errors
window.errorMonitor.getErrorStats()

// Clear errors
window.errorMonitor.clearErrors()

// Get trends
window.errorMonitor.getErrorTrends()
```