import React from 'react'
import SafeImage from './SafeImage'
import ImageDebugger from './ImageDebugger'

/**
 * Test component to demonstrate SafeImage with various data scenarios
 * Shows how the component handles different types of image data
 */
const SafeImageTest = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  // Test scenarios for SafeImage validation
  const testScenarios = [
    {
      name: "Valid Sanity Image",
      image: {
        asset: {
          _ref: "image-test123-400x300-jpg"
        },
        alt: "Test capybara image",
        caption: "Capybara at Acuario Michin Puebla"
      }
    },
    {
      name: "Missing Asset Reference",
      image: {
        alt: "Test image",
        caption: "This will fail validation"
      }
    },
    {
      name: "Null Image",
      image: null
    },
    {
      name: "Undefined Image",
      image: undefined
    },
    {
      name: "String Instead of Object",
      image: "/images/directory_acuario_michin_puebla_capybara.jpg"
    },
    {
      name: "Empty Object",
      image: {}
    },
    {
      name: "Asset Without _ref",
      image: {
        asset: {
          url: "https://example.com/image.jpg"
        },
        alt: "Image with URL but no _ref"
      }
    }
  ]

  return (
    <div style={{
      margin: '20px 0',
      padding: '20px',
      border: '2px solid #2196F3',
      borderRadius: '8px',
      backgroundColor: '#f3f9ff'
    }}>
      <h2 style={{ margin: '0 0 16px 0', color: '#1976D2' }}>
        🧪 SafeImage Test Scenarios
      </h2>
      
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        This shows how SafeImage handles different types of image data. 
        Check the console and error dashboard for detailed diagnostics.
      </p>

      {/* Image Debugger for all test images */}
      <ImageDebugger 
        images={testScenarios.map(scenario => scenario.image)}
        title="Test Image Validation Results"
      />

      {/* Visual test of each scenario */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '16px',
        marginTop: '20px'
      }}>
        {testScenarios.map((scenario, index) => (
          <div key={index} style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'white'
          }}>
            <h3 style={{ 
              margin: '0 0 12px 0', 
              fontSize: '14px',
              color: '#333'
            }}>
              {scenario.name}
            </h3>
            
            <div style={{ marginBottom: '12px' }}>
              <SafeImage 
                image={scenario.image}
                identifier={`test-${index}`}
                width={200}
                height={150}
                alt={`Test scenario: ${scenario.name}`}
                fallbackText={`${scenario.name} - No image`}
                fallbackIcon="🖼️"
                onError={(error, validation) => {
                  console.log(`Test ${scenario.name} error:`, error, validation)
                }}
              />
            </div>
            
            <details style={{ fontSize: '12px' }}>
              <summary style={{ cursor: 'pointer', color: '#666' }}>
                View Image Data
              </summary>
              <pre style={{
                marginTop: '8px',
                padding: '8px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                fontSize: '10px',
                overflow: 'auto'
              }}>
                {JSON.stringify(scenario.image, null, 2)}
              </pre>
            </details>
          </div>
        ))}
      </div>

      {/* Instructions for using real images */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        backgroundColor: '#e8f5e8',
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h3 style={{ margin: '0 0 8px 0', color: '#2e7d32' }}>
          📝 To Use Your Capybara Image:
        </h3>
        <ol style={{ margin: '8px 0', paddingLeft: '20px', fontSize: '14px' }}>
          <li>Open Sanity Studio (usually at localhost:3333)</li>
          <li>Create or edit a petting zoo entry</li>
          <li>Upload your capybara image to the "Main Image" field</li>
          <li>Add alt text: "Capybara at Acuario Michin Puebla"</li>
          <li>Save the entry</li>
          <li>Refresh this page to see the properly formatted image</li>
        </ol>
        <p style={{ 
          fontSize: '12px', 
          color: '#666', 
          margin: '8px 0 0 0',
          fontStyle: 'italic' 
        }}>
          The image path you provided is a local file. Sanity will convert it to a proper 
          web-accessible URL with the correct format for SafeImage validation.
        </p>
      </div>
    </div>
  )
}

export default SafeImageTest