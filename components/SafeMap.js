import React, { useState, useEffect } from 'react'
import DashboardMap from './DashboardMap'
import { validateLocationData, sanitizeArrayData } from '../utils/validation'
import { logMapError, logValidationError } from '../utils/errorMonitoring'

/**
 * SafeMap wrapper for the DashboardMap component to handle invalid location data
 * Implements defensive programming to prevent map crashes from invalid data
 */
const SafeMap = ({ 
  pettingZoos = [],
  onError,
  fallbackComponent: FallbackComponent,
  showErrorDetails = false,
  retryAttempts = 3,
  retryDelay = 2000,
  ...props 
}) => {
  const [mapError, setMapError] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [validatedZoos, setValidatedZoos] = useState([])

  // Validate and sanitize zoo data on mount and when data changes
  useEffect(() => {
    try {
      const sanitizedZoos = sanitizeArrayData(pettingZoos)
      const validZoos = []
      const invalidZoos = []

      sanitizedZoos.forEach((zoo, index) => {
        if (!zoo || typeof zoo !== 'object') {
          invalidZoos.push({ index, reason: 'Zoo data is null or not an object' })
          return
        }

        // Validate location data if present
        if (zoo.location) {
          const locationValidation = validateLocationData(zoo.location)
          if (locationValidation.isValid) {
            validZoos.push({
              ...zoo,
              location: locationValidation.data
            })
          } else {
            invalidZoos.push({ 
              index, 
              zoo: zoo.name || 'Unknown', 
              reason: 'Invalid location data',
              errors: locationValidation.errors 
            })
            // Include zoo without location for other map features
            validZoos.push({
              ...zoo,
              location: null
            })
          }
        } else {
          // Include zoo without location
          validZoos.push({
            ...zoo,
            location: null
          })
        }
      })

      if (invalidZoos.length > 0) {
        console.warn('SafeMap: Some zoos have invalid location data', invalidZoos)
        
        // Log validation errors for each invalid zoo
        invalidZoos.forEach(invalidZoo => {
          logValidationError('SafeMap', invalidZoo.errors || ['Invalid location data'], {
            zooIndex: invalidZoo.index,
            zooName: invalidZoo.zoo,
            reason: invalidZoo.reason
          })
        })
      }

      setValidatedZoos(validZoos)
      setMapError(null) // Clear any previous errors
    } catch (error) {
      console.error('SafeMap: Error validating zoo data', error)
      setMapError({
        type: 'validation',
        message: 'Failed to validate zoo data',
        originalError: error
      })
    }
  }, [pettingZoos])

  // Handle map component errors
  const handleMapError = (error) => {
    console.error('SafeMap: Map component error', error)
    
    const mapError = {
      type: 'map',
      message: 'Map failed to load or render',
      originalError: error
    }
    
    // Log to error monitoring system
    logMapError(mapError, {
      pettingZoosCount: validatedZoos.length,
      retryAttempts,
      retryCount,
      showErrorDetails
    })
    
    setMapError(mapError)
    
    // Call custom error handler if provided
    if (onError) {
      onError(mapError)
    }
  }

  // Retry loading the map
  const retryMap = async () => {
    if (retryCount >= retryAttempts) {
      console.warn('SafeMap: Maximum retry attempts reached')
      return
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      // Clear error to trigger re-render
      setMapError(null)
    } catch (error) {
      console.error('SafeMap: Retry failed', error)
    } finally {
      setIsRetrying(false)
    }
  }

  // Check if Google Maps API key is available
  const hasApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!hasApiKey) {
    const apiKeyError = {
      type: 'config',
      message: 'Google Maps API key is not configured',
      suggestion: 'Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables'
    }

    return renderError(apiKeyError)
  }

  // Render error state
  function renderError(error) {
    if (FallbackComponent) {
      return <FallbackComponent error={error} onRetry={retryMap} />
    }

    return (
      <div 
        className="safe-map-error"
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>
          🗺️
        </div>
        
        <h3 style={{ 
          margin: '0 0 1rem 0', 
          color: '#d93025',
          fontSize: '1.2rem'
        }}>
          Map Unavailable
        </h3>
        
        <p style={{ 
          margin: '0 0 1.5rem 0', 
          color: '#666',
          maxWidth: '400px',
          lineHeight: '1.4'
        }}>
          {error.message}
          {error.suggestion && (
            <>
              <br />
              <small style={{ fontStyle: 'italic' }}>
                {error.suggestion}
              </small>
            </>
          )}
        </p>

        {showErrorDetails && error.originalError && (
          <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>
              Technical Details
            </summary>
            <pre style={{ 
              fontSize: '0.8rem', 
              color: '#999',
              marginTop: '0.5rem',
              padding: '0.5rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {error.originalError.toString()}
            </pre>
          </details>
        )}

        {error.type !== 'config' && retryCount < retryAttempts && (
          <button
            onClick={retryMap}
            disabled={isRetrying}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: isRetrying ? '#ccc' : '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRetrying ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold'
            }}
          >
            {isRetrying ? 'Retrying...' : `Try Again (${retryAttempts - retryCount} attempts left)`}
          </button>
        )}

        {retryCount >= retryAttempts && (
          <p style={{ color: '#999', fontSize: '0.9rem', fontStyle: 'italic' }}>
            Please refresh the page or contact support if the problem persists.
          </p>
        )}
      </div>
    )
  }

  // Render loading state while retrying
  if (isRetrying) {
    return (
      <div 
        className="safe-map-loading"
        style={{
          width: '100%',
          height: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8f8f8',
          border: '1px solid #ddd',
          borderRadius: '8px'
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <p style={{ margin: 0, color: '#666' }}>Loading map...</p>
        </div>
      </div>
    )
  }

  // If there's an error, render error state
  if (mapError) {
    return renderError(mapError)
  }

  // Render the actual map with error boundary
  try {
    return (
      <ErrorBoundary onError={handleMapError}>
        <DashboardMap 
          pettingZoos={validatedZoos}
          {...props}
        />
      </ErrorBoundary>
    )
  } catch (error) {
    handleMapError(error)
    return renderError({
      type: 'render',
      message: 'Failed to render map component',
      originalError: error
    })
  }
}

/**
 * Simple error boundary component for catching map rendering errors
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('SafeMap ErrorBoundary caught an error:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError(error)
    }
  }

  render() {
    if (this.state.hasError) {
      // Return null to let parent handle error rendering
      return null
    }

    return this.props.children
  }
}

export default SafeMap