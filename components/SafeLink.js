import React from 'react'
import Link from 'next/link'
import { validateSlugData } from '../utils/validation'
import { logLinkError, logValidationError } from '../utils/errorMonitoring'

/**
 * SafeLink component that validates slug data before navigation and handles broken links
 * Implements defensive programming to prevent navigation errors from invalid slug data
 */
const SafeLink = ({ 
  href,
  slug,
  basePath = '',
  children,
  fallbackComponent: FallbackComponent,
  fallbackText = 'Link unavailable',
  onError,
  className,
  style,
  disabled = false,
  ...props 
}) => {
  // Determine the actual href to use
  let finalHref = href
  
  // If slug is provided, validate it and construct href
  if (slug && !href) {
    const validationResult = validateSlugData(slug)
    
    if (!validationResult.isValid) {
      const errorData = {
        slug,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      }
      
      console.warn('SafeLink: Invalid slug data', errorData)
      
      // Log to error monitoring system
      logValidationError('SafeLink', validationResult.errors, {
        slug,
        basePath,
        href
      })
      
      // Call custom error handler if provided
      if (onError) {
        onError(new Error('Invalid slug data'), validationResult)
      }
      
      // Render fallback for invalid slug
      return renderFallback()
    }
    
    const validatedSlug = validationResult.data
    finalHref = basePath ? `${basePath}/${validatedSlug.current}` : `/${validatedSlug.current}`
  }
  
  // Validate final href
  if (!finalHref || typeof finalHref !== 'string' || finalHref.trim() === '') {
    const errorData = { href, slug, basePath }
    console.warn('SafeLink: No valid href available', errorData)
    
    // Log to error monitoring system
    logLinkError(errorData, { children, className, disabled })
    
    if (onError) {
      onError(new Error('No valid href available'), errorData)
    }
    
    return renderFallback()
  }
  
  // Render fallback content when link is invalid or disabled
  function renderFallback() {
    if (FallbackComponent) {
      return <FallbackComponent />
    }
    
    return (
      <span 
        className={`safe-link-fallback ${className || ''}`}
        style={{
          color: '#999',
          cursor: 'not-allowed',
          textDecoration: 'line-through',
          ...style
        }}
        title="Link unavailable"
        {...props}
      >
        {children || fallbackText}
      </span>
    )
  }
  
  // If disabled, render as span instead of link
  if (disabled) {
    return (
      <span 
        className={`safe-link-disabled ${className || ''}`}
        style={{
          color: '#999',
          cursor: 'not-allowed',
          ...style
        }}
        {...props}
      >
        {children}
      </span>
    )
  }
  
  // Sanitize href to prevent XSS
  const sanitizedHref = sanitizeHref(finalHref)
  
  if (!sanitizedHref) {
    console.warn('SafeLink: Href failed sanitization', finalHref)
    return renderFallback()
  }
  
  // Handle external links
  if (isExternalLink(sanitizedHref)) {
    return (
      <a
        href={sanitizedHref}
        className={className}
        style={style}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    )
  }
  
  // Render Next.js Link for internal navigation
  return (
    <Link 
      href={sanitizedHref}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Link>
  )
}

/**
 * Sanitizes href to prevent XSS attacks and ensure valid URLs
 * @param {string} href - The href to sanitize
 * @returns {string|null} Sanitized href or null if invalid
 */
function sanitizeHref(href) {
  if (typeof href !== 'string') {
    return null
  }
  
  const trimmedHref = href.trim()
  
  // Block dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerHref = trimmedHref.toLowerCase()
  
  for (const protocol of dangerousProtocols) {
    if (lowerHref.startsWith(protocol)) {
      console.warn('SafeLink: Blocked dangerous protocol', protocol)
      return null
    }
  }
  
  // Allow relative paths, absolute paths, and safe protocols
  if (trimmedHref.startsWith('/') || 
      trimmedHref.startsWith('#') || 
      trimmedHref.startsWith('http://') || 
      trimmedHref.startsWith('https://') ||
      trimmedHref.startsWith('mailto:') ||
      trimmedHref.startsWith('tel:')) {
    return trimmedHref
  }
  
  // For relative paths without leading slash, add it
  if (!trimmedHref.includes('://') && !trimmedHref.startsWith('#')) {
    return `/${trimmedHref}`
  }
  
  return trimmedHref
}

/**
 * Determines if a link is external
 * @param {string} href - The href to check
 * @returns {boolean} True if external link
 */
function isExternalLink(href) {
  return href.startsWith('http://') || 
         href.startsWith('https://') || 
         href.startsWith('mailto:') || 
         href.startsWith('tel:')
}

export default SafeLink