import React, { useState } from 'react'
import { urlFor } from '../sanity'
import { validateImageData } from '../utils/validation'
import { logImageError, logValidationError } from '../utils/errorMonitoring'
import { diagnoseImageValidation } from '../utils/imageValidationDiagnostic'

/**
 * SafeImage component that handles missing image data and provides fallback images
 * Implements defensive programming to prevent crashes from invalid image data
 */
const SafeImage = ({ 
  image, 
  identifier = 'image',
  width = 400,
  height = 250,
  alt,
  className,
  style,
  fallbackText = 'No image available',
  fallbackIcon = '📷',
  onError,
  ...props 
}) => {
  const [imageError, setImageError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Validate image data using validation utility
  const validationResult = validateImageData(image)
  const isValidImage = validationResult.isValid && !imageError
  const validatedImage = validationResult.data

  // Log validation errors with diagnostic information
  if (!validationResult.isValid) {
    const diagnosis = diagnoseImageValidation(image, {
      identifier,
      width,
      height,
      alt,
      component: 'SafeImage'
    })
    
    logValidationError('SafeImage', validationResult.errors, {
      identifier,
      image,
      props: { width, height, alt },
      diagnosis
    })
    
    // In development, show detailed diagnostic info
    if (process.env.NODE_ENV === 'development') {
      console.group(`🖼️ SafeImage Validation Failed: ${identifier || 'unnamed'}`)
      console.log('Issue:', diagnosis.issue)
      console.log('Severity:', diagnosis.severity)
      console.log('Suggested fixes:', diagnosis.fixes)
      console.log('Debug info:', diagnosis.debugInfo)
      console.groupEnd()
    }
  }

  // Determine CSS classes
  const baseClass = identifier === 'main-image' ? 'main-image' : 'image'
  const finalClassName = className ? `${baseClass} ${className}` : baseClass

  // Handle image load error
  const handleImageError = (error) => {
    const errorData = {
      image: validatedImage,
      error: error.target?.src,
      validationErrors: validationResult.errors
    }
    
    console.warn('SafeImage: Image failed to load', errorData)
    
    // Log to error monitoring system
    logImageError(errorData, {
      identifier,
      width,
      height,
      alt,
      fallbackText
    })
    
    setImageError(true)
    setIsLoading(false)
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, validationResult)
    }
  }

  // Handle successful image load
  const handleImageLoad = () => {
    setIsLoading(false)
  }

  // Render fallback content when image is invalid or failed to load
  const renderFallback = () => (
    <div 
      className={`${finalClassName} image-fallback`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: '1px dashed #ddd',
        minHeight: height ? `${height}px` : '200px',
        width: width ? `${width}px` : '100%',
        ...style
      }}
      {...props}
    >
      <span 
        style={{ 
          fontSize: '2rem', 
          marginBottom: '0.5rem',
          opacity: 0.7 
        }}
        aria-hidden="true"
      >
        {fallbackIcon}
      </span>
      <p 
        style={{ 
          margin: 0, 
          fontSize: '0.9rem',
          textAlign: 'center',
          padding: '0 1rem'
        }}
      >
        {fallbackText}
      </p>
    </div>
  )

  // Render loading state
  const renderLoading = () => (
    <div 
      className={`${finalClassName} image-loading`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
        color: '#999',
        minHeight: height ? `${height}px` : '200px',
        width: width ? `${width}px` : '100%',
        ...style
      }}
      {...props}
    >
      <span style={{ fontSize: '1rem' }}>Loading...</span>
    </div>
  )

  // If image validation failed or image error occurred, show fallback
  if (!isValidImage) {
    return renderFallback()
  }

  // Generate image URL with error handling
  let imageUrl
  try {
    const urlBuilder = urlFor(validatedImage)
    if (width) urlBuilder.width(width)
    if (height) urlBuilder.height(height)
    imageUrl = urlBuilder.crop('fill').auto('format').url()
  } catch (error) {
    console.error('SafeImage: Failed to generate image URL', error)
    return renderFallback()
  }

  // Determine alt text with fallbacks
  const imageAlt = alt || validatedImage.alt || 'Image'

  return (
    <div className={finalClassName} style={style}>
      {isLoading && renderLoading()}
      <img
        src={imageUrl}
        alt={imageAlt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        style={{
          display: isLoading ? 'none' : 'block',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
        {...props}
      />
    </div>
  )
}

export default SafeImage