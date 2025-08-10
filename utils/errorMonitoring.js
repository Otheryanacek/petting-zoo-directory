/**
 * Centralized error monitoring and reporting system
 * Collects errors from safe components and provides analytics
 */

class ErrorMonitor {
  constructor() {
    this.errors = []
    this.errorCounts = new Map()
    this.isEnabled = process.env.NODE_ENV === 'development' || process.env.ENABLE_ERROR_MONITORING === 'true'
  }

  /**
   * Log an error from a safe component
   * @param {string} component - Component name (SafeImage, SafeLink, SafeMap)
   * @param {string} errorType - Type of error (validation, network, rendering, etc.)
   * @param {object} errorData - Error details
   * @param {object} context - Additional context (props, state, etc.)
   */
  logError(component, errorType, errorData, context = {}) {
    if (!this.isEnabled) return

    const errorEntry = {
      timestamp: new Date().toISOString(),
      component,
      errorType,
      errorData,
      context,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    }

    this.errors.push(errorEntry)
    
    // Update error counts
    const key = `${component}:${errorType}`
    this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 ${component} Error: ${errorType}`)
      console.error('Error Data:', errorData)
      console.log('Context:', context)
      console.log('Full Entry:', errorEntry)
      console.groupEnd()
    }

    // In production, you could send to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorEntry)
    }
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    const stats = {
      totalErrors: this.errors.length,
      errorsByComponent: {},
      errorsByType: {},
      recentErrors: this.errors.slice(-10),
      topErrors: []
    }

    // Group by component
    this.errors.forEach(error => {
      stats.errorsByComponent[error.component] = (stats.errorsByComponent[error.component] || 0) + 1
      stats.errorsByType[error.errorType] = (stats.errorsByType[error.errorType] || 0) + 1
    })

    // Get top errors
    stats.topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key, count]) => ({ error: key, count }))

    return stats
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errors = []
    this.errorCounts.clear()
  }

  /**
   * Send error to external monitoring service (placeholder)
   */
  sendToExternalService(errorEntry) {
    // Example: Send to Sentry, LogRocket, or custom endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorEntry)
    // })
  }

  /**
   * Get error trends over time
   */
  getErrorTrends(timeWindow = 24 * 60 * 60 * 1000) { // 24 hours default
    const now = Date.now()
    const cutoff = now - timeWindow
    
    const recentErrors = this.errors.filter(error => 
      new Date(error.timestamp).getTime() > cutoff
    )

    return {
      recentCount: recentErrors.length,
      trend: this.calculateTrend(recentErrors),
      hourlyBreakdown: this.getHourlyBreakdown(recentErrors)
    }
  }

  calculateTrend(errors) {
    if (errors.length < 2) return 'stable'
    
    const midpoint = Math.floor(errors.length / 2)
    const firstHalf = errors.slice(0, midpoint).length
    const secondHalf = errors.slice(midpoint).length
    
    if (secondHalf > firstHalf * 1.2) return 'increasing'
    if (secondHalf < firstHalf * 0.8) return 'decreasing'
    return 'stable'
  }

  getHourlyBreakdown(errors) {
    const breakdown = {}
    errors.forEach(error => {
      const hour = new Date(error.timestamp).getHours()
      breakdown[hour] = (breakdown[hour] || 0) + 1
    })
    return breakdown
  }
}

// Create singleton instance
const errorMonitor = new ErrorMonitor()

// Helper functions for safe components
export const logImageError = (errorData, context) => {
  errorMonitor.logError('SafeImage', 'image_load_failed', errorData, context)
}

export const logLinkError = (errorData, context) => {
  errorMonitor.logError('SafeLink', 'invalid_link_data', errorData, context)
}

export const logMapError = (errorData, context) => {
  errorMonitor.logError('SafeMap', 'map_rendering_failed', errorData, context)
}

export const logValidationError = (component, errorData, context) => {
  errorMonitor.logError(component, 'validation_failed', errorData, context)
}

// Export the monitor instance
export default errorMonitor