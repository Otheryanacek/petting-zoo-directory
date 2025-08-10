import React from 'react'
import SafeImage from './SafeImage'
import SafeLink from './SafeLink'
import SafeMap from './SafeMap'

/**
 * Example component demonstrating usage of safe component wrappers
 * This shows how to use SafeImage, SafeLink, and SafeMap components
 * to handle missing or invalid data gracefully
 */
const SafeComponentsExample = ({ zoo }) => {
  return (
    <div className="safe-components-example">
      <h2>Safe Components Example</h2>
      
      {/* SafeImage usage */}
      <div className="image-section">
        <h3>Safe Image Component</h3>
        <SafeImage 
          image={zoo?.mainImage}
          identifier="main-image"
          width={400}
          height={250}
          alt={`${zoo?.name || 'Zoo'} main image`}
          fallbackText="Zoo image not available"
          fallbackIcon="🏞️"
        />
      </div>

      {/* SafeLink usage */}
      <div className="link-section">
        <h3>Safe Link Component</h3>
        <SafeLink 
          slug={zoo?.slug}
          basePath="/zoo"
          className="zoo-link"
        >
          Visit {zoo?.name || 'this zoo'}
        </SafeLink>
        
        <br /><br />
        
        <SafeLink 
          href={zoo?.website}
          className="external-link"
        >
          Official Website
        </SafeLink>
      </div>

      {/* SafeMap usage */}
      <div className="map-section">
        <h3>Safe Map Component</h3>
        <SafeMap 
          pettingZoos={zoo ? [zoo] : []}
          showErrorDetails={true}
          retryAttempts={3}
          style={{ height: '300px' }}
        />
      </div>
    </div>
  )
}

export default SafeComponentsExample