import React, { useState } from 'react'
import { diagnoseImageValidation, createImageValidationReport } from '../utils/imageValidationDiagnostic'
import { validateImageData } from '../utils/validation'

/**
 * Development component to debug image validation issues
 * Only shows in development mode
 */
const ImageDebugger = ({ images = [], title = "Image Validation Debug" }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Convert single image to array
  const imageArray = Array.isArray(images) ? images : [images]
  
  // Filter out valid images to focus on problems
  const problematicImages = imageArray
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => {
      const validation = validateImageData(image)
      return !validation.isValid
    })

  if (problematicImages.length === 0) {
    return (
      <div style={{
        padding: '8px 12px',
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: '4px',
        margin: '8px 0',
        fontSize: '12px',
        color: '#2e7d32'
      }}>
        ✅ All images valid ({imageArray.length} checked)
      </div>
    )
  }

  const report = createImageValidationReport(
    problematicImages.map(({ image, index }) => ({ 
      image, 
      context: { index, title } 
    }))
  )

  return (
    <div style={{
      border: '2px solid #ff9800',
      borderRadius: '8px',
      margin: '16px 0',
      backgroundColor: '#fff3e0',
      fontFamily: 'monospace',
      fontSize: '12px'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '12px',
          backgroundColor: '#ff9800',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <strong>🖼️ {title} - {problematicImages.length} issues found</strong>
        <span>{isExpanded ? '▼' : '▶'}</span>
      </div>

      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* Summary */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Summary</h4>
            <div>Total images: {imageArray.length}</div>
            <div>Failed validation: {problematicImages.length}</div>
            <div>High severity: {report.severityBreakdown.high}</div>
            <div>Medium severity: {report.severityBreakdown.medium}</div>
          </div>

          {/* Issue Patterns */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Common Issues</h4>
            {Object.entries(report.issuePatterns).map(([issue, data]) => (
              <div key={issue} style={{ 
                marginBottom: '8px',
                padding: '8px',
                backgroundColor: data.severity === 'high' ? '#ffebee' : '#fff8e1',
                borderLeft: `4px solid ${data.severity === 'high' ? '#f44336' : '#ff9800'}`,
                borderRadius: '4px'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {issue} ({data.count} times)
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  Severity: {data.severity}
                </div>
              </div>
            ))}
          </div>

          {/* Top Fixes */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Recommended Fixes</h4>
            {report.commonFixes.slice(0, 3).map(({ fix, count }) => (
              <div key={fix} style={{ 
                marginBottom: '4px',
                fontSize: '11px',
                color: '#333'
              }}>
                • {fix} (helps with {count} issues)
              </div>
            ))}
          </div>

          {/* Individual Images */}
          <div>
            <h4 style={{ margin: '0 0 8px 0', color: '#e65100' }}>Individual Images</h4>
            {problematicImages.map(({ image, index }) => {
              const diagnosis = diagnoseImageValidation(image, { index })
              return (
                <div key={index} style={{
                  marginBottom: '12px',
                  padding: '8px',
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                    Image #{index} - {diagnosis.severity} severity
                  </div>
                  <div style={{ color: '#d32f2f', marginBottom: '4px' }}>
                    {diagnosis.issue}
                  </div>
                  <details style={{ fontSize: '10px' }}>
                    <summary style={{ cursor: 'pointer', color: '#666' }}>
                      Debug Info
                    </summary>
                    <pre style={{ 
                      marginTop: '4px',
                      padding: '4px',
                      backgroundColor: '#f5f5f5',
                      borderRadius: '2px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(diagnosis.debugInfo, null, 2)}
                    </pre>
                  </details>
                  <div style={{ marginTop: '8px' }}>
                    <strong>Quick Fixes:</strong>
                    <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                      {diagnosis.fixes.slice(0, 2).map((fix, fixIndex) => (
                        <li key={fixIndex} style={{ fontSize: '10px', color: '#333' }}>
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Copy Debug Command */}
          <div style={{ 
            marginTop: '16px',
            padding: '8px',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            fontSize: '10px'
          }}>
            <strong>Debug in Console:</strong>
            <div style={{ 
              marginTop: '4px',
              padding: '4px',
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '2px',
              fontFamily: 'monospace'
            }}>
              import {`{debugImageValidation}`} from '../utils/imageValidationDiagnostic'<br/>
              debugImageValidation(yourImageData, 'ComponentName')
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageDebugger