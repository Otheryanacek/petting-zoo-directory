import React, { useState, useEffect } from 'react'
import errorMonitor from '../utils/errorMonitoring'

/**
 * Development dashboard for monitoring safe component errors
 * Only shows in development mode
 */
const ErrorDashboard = () => {
  const [stats, setStats] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  useEffect(() => {
    const updateStats = () => {
      setStats(errorMonitor.getErrorStats())
    }

    updateStats()

    if (autoRefresh) {
      const interval = setInterval(updateStats, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (!isVisible) {
    return (
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: stats?.totalErrors > 0 ? '#ff4444' : '#4CAF50',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}
        onClick={() => setIsVisible(true)}
        title="Click to open error dashboard"
      >
        🛡️ {stats?.totalErrors || 0} errors
      </div>
    )
  }

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        backgroundColor: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 9999,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{
          backgroundColor: '#f5f5f5',
          padding: '12px 16px',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
          🛡️ Safe Components Dashboard
        </h3>
        <div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              background: autoRefresh ? '#4CAF50' : '#ccc',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              marginRight: '8px',
              cursor: 'pointer'
            }}
          >
            {autoRefresh ? 'Auto' : 'Manual'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '0 4px'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
        {!stats ? (
          <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Loading...</p>
        ) : (
          <>
            {/* Summary */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Total Errors: <strong>{stats.totalErrors}</strong>
              </div>
              
              {stats.totalErrors === 0 ? (
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: '#e8f5e8', 
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#2e7d32'
                }}>
                  ✅ All safe components working correctly!
                </div>
              ) : (
                <>
                  {/* Errors by Component */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
                      Errors by Component:
                    </h4>
                    {Object.entries(stats.errorsByComponent).map(([component, count]) => (
                      <div key={component} style={{ fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold' }}>{component}:</span> {count}
                      </div>
                    ))}
                  </div>

                  {/* Top Errors */}
                  <div style={{ marginBottom: '12px' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
                      Most Common Errors:
                    </h4>
                    {stats.topErrors.slice(0, 3).map(({ error, count }) => (
                      <div key={error} style={{ fontSize: '11px', marginBottom: '4px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '10px' }}>{error}</span>
                        <span style={{ marginLeft: '8px', fontWeight: 'bold' }}>({count})</span>
                      </div>
                    ))}
                  </div>

                  {/* Recent Errors */}
                  <div>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 'bold' }}>
                      Recent Errors:
                    </h4>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {stats.recentErrors.map((error, index) => (
                        <div 
                          key={index}
                          style={{
                            fontSize: '10px',
                            marginBottom: '8px',
                            padding: '8px',
                            backgroundColor: '#fff5f5',
                            borderRadius: '4px',
                            border: '1px solid #ffebee'
                          }}
                        >
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {error.component} - {error.errorType}
                          </div>
                          <div style={{ color: '#666', marginBottom: '4px' }}>
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                            {JSON.stringify(error.errorData, null, 2).substring(0, 100)}...
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
              <button
                onClick={() => {
                  errorMonitor.clearErrors()
                  setStats(errorMonitor.getErrorStats())
                }}
                style={{
                  backgroundColor: '#ff4444',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                Clear All Errors
              </button>
              <button
                onClick={() => setStats(errorMonitor.getErrorStats())}
                style={{
                  backgroundColor: '#2196F3',
                  color: 'white',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ErrorDashboard