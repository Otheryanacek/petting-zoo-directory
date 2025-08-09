import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { event } from '../lib/analytics';

const MonitoringDashboard = () => {
  const [errors, setErrors] = useState([]);
  const [performance, setPerformance] = useState({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or for admin users
    const isDev = process.env.NODE_ENV === 'development';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    setIsVisible(isDev || isAdmin);
  }, []);

  const testError = () => {
    try {
      throw new Error('Test error for monitoring');
    } catch (error) {
      Sentry.captureException(error);
      console.error('Test error captured:', error);
    }
  };

  const testAnalytics = () => {
    event({
      action: 'test_event',
      category: 'Testing',
      label: 'Monitoring Dashboard Test',
      value: 1,
    });
    console.log('Test analytics event sent');
  };

  const clearErrors = () => {
    setErrors([]);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: 'white',
      border: '1px solid #ccc',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      maxWidth: '300px',
      fontSize: '14px'
    }}>
      <h4 style={{ margin: '0 0 12px 0', color: '#333' }}>
        🔍 Monitoring Dashboard
      </h4>
      
      <div style={{ marginBottom: '12px' }}>
        <button
          onClick={testError}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px',
            fontSize: '12px'
          }}
        >
          Test Error
        </button>
        
        <button
          onClick={testAnalytics}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Test Analytics
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <div>Sentry: {process.env.NEXT_PUBLIC_SENTRY_DSN ? '✅' : '❌'}</div>
        <div>GA: {process.env.NEXT_PUBLIC_GA_ID ? '✅' : '❌'}</div>
        <div>Environment: {process.env.NODE_ENV}</div>
      </div>

      {errors.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: '#dc3545' }}>Recent Errors:</strong>
            <button
              onClick={clearErrors}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#007bff',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '4px' }}>
            {errors.map((error, index) => (
              <div key={index} style={{ 
                padding: '4px', 
                backgroundColor: '#f8f9fa', 
                margin: '2px 0',
                borderRadius: '2px',
                fontSize: '11px'
              }}>
                {error.message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringDashboard;