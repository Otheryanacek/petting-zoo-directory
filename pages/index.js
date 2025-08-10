import { sanityClient } from "../sanity"
import SafeMap from "../components/SafeMap"
import PettingZooCard from "../components/PettingZooCard"
import ErrorBoundary from "../components/ErrorBoundary"
import ErrorDashboard from "../components/ErrorDashboard"
import ImageDebugger from "../components/ImageDebugger"
import SafeImageTest from "../components/SafeImageTest"
import Head from "next/head"
import { useState, useEffect } from "react"
import { validateAndSanitizeData } from "../utils/validation"
import { addTestDataToZoos } from "../utils/testData"

const Home = ({ pettingZoos: initialPettingZoos, error, warnings, fallbackMode }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Add test data in development mode
  const displayZoos = process.env.NODE_ENV === 'development' 
    ? addTestDataToZoos(initialPettingZoos)
    : initialPettingZoos

  console.log('Home component received:', { 
    pettingZoos: initialPettingZoos, 
    error, 
    warnings, 
    fallbackMode 
  })

  // Display warnings in development mode
  if (process.env.NODE_ENV === 'development' && warnings && warnings.length > 0) {
    console.warn('Data validation warnings:', warnings)
  }

  // Handle critical errors
  if (error) {
    return (
      <div className="main">
        <div className="feed-container">
          <h1>Discover Amazing Petting Zoos</h1>
          <div className="error-message">
            <p>We're having trouble loading petting zoo data right now.</p>
            <p>Please try refreshing the page or check back later.</p>
            {process.env.NODE_ENV === 'development' && (
              <details>
                <summary>Error Details (Development)</summary>
                <pre>{error}</pre>
              </details>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Handle empty data with fallback message
  if (!displayZoos || !Array.isArray(displayZoos) || displayZoos.length === 0) {
    return (
      <div className="main">
        <div className="feed-container">
          <h1>Discover Amazing Petting Zoos</h1>
          <div className="empty-state">
            <p>No petting zoos are currently available.</p>
            <p>Please check back later for updated listings.</p>
            {fallbackMode && (
              <p className="fallback-notice">
                <em>Running in fallback mode due to data loading issues.</em>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }



  return (
    <>
      <Head>
        <title>Petting Zoo Directory - Find Amazing Petting Zoos Near You</title>
        <meta name="description" content="Discover the best petting zoos in your area. Meet friendly animals, read visitor reviews, see photos, and plan your perfect family visit." />
        <meta name="keywords" content="petting zoo, family fun, animals, kids activities, farm animals, interactive experiences" />
        <meta property="og:title" content="Petting Zoo Directory - Find Amazing Petting Zoos Near You" />
        <meta property="og:description" content="Discover the best petting zoos in your area. Meet friendly animals and plan your perfect family visit." />
        <meta property="og:type" content="website" />
        <html lang="en" />
      </Head>
      <div className="main">
        <div className="feed-container">
          <h1>Discover Amazing Petting Zoos</h1>
          <p>Found {displayZoos.length} petting zoos 
            {process.env.NODE_ENV === 'development' && (
              <span style={{ fontSize: '12px', color: '#666' }}>
                (includes {displayZoos.length - initialPettingZoos.length} test entries)
              </span>
            )}
          </p>
          
          {fallbackMode && (
            <div className="fallback-notice">
              <p><em>Some data may be incomplete due to loading issues.</em></p>
            </div>
          )}
          
          {warnings && warnings.length > 0 && process.env.NODE_ENV === 'development' && (
            <div className="validation-warnings">
              <details>
                <summary>Data Validation Warnings ({warnings.length})</summary>
                <ul>
                  {warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </details>
            </div>
          )}

          {/* SafeImage Test Component - Development Only */}
          <SafeImageTest />

          {/* Image Validation Debugger - Development Only */}
          <ImageDebugger 
            images={displayZoos.map(zoo => zoo.mainImage)}
            title="Main Images Validation (Including Test Data)"
          />

          <div className="feed">
            {displayZoos.map((zoo) => (
              <PettingZooCard key={zoo._id} zoo={zoo} />
            ))}
          </div>
        </div>
        <div className="map">
          {isClient && (
            <SafeMap 
              pettingZoos={displayZoos}
              showErrorDetails={process.env.NODE_ENV === 'development'}
              retryAttempts={3}
              retryDelay={2000}
              onError={(error) => {
                console.error('Map error:', error)
                // Could send to error tracking service here
              }}
            />
          )}
        </div>
        
        {/* Error Dashboard - Development Only */}
        <ErrorDashboard />
      </div>
    </>
  )
}

export const getServerSideProps = async () => {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  // Enhanced query with comprehensive data selection
  const pettingZooQuery = `*[ _type == "pettingZoo"] | order(name asc) {
    _id,
    name,
    slug,
    description,
    mainImage,
    images,
    location,
    address,
    phone,
    website,
    zooType,
    admissionPrice,
    animalCount,
    animalTypes,
    operatingHours,
    reviews,
    amenities,
    animals,
    contactInfo,
    hours
  }`

  // Retry mechanism for network failures
  const fetchWithRetry = async (retryCount = 0) => {
    try {
      console.log(`Fetching petting zoo data... (attempt ${retryCount + 1}/${maxRetries})`)
      const rawData = await sanityClient.fetch(pettingZooQuery)
      return rawData
    } catch (error) {
      console.error(`Fetch attempt ${retryCount + 1} failed:`, error.message)
      
      if (retryCount < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchWithRetry(retryCount + 1)
      }
      throw error
    }
  }

  try {
    // Fetch data with retry mechanism
    const rawData = await fetchWithRetry()
    console.log(`Raw data received: ${rawData ? rawData.length : 0} items`)

    // Validate and sanitize the data using our validation utilities
    const validationResult = validateAndSanitizeData(rawData)
    
    console.log('Validation results:', {
      isValid: validationResult.isValid,
      dataCount: validationResult.data.pettingZoos ? validationResult.data.pettingZoos.length : 0,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    })

    // Log validation issues in development
    if (process.env.NODE_ENV === 'development') {
      if (validationResult.errors.length > 0) {
        console.error('Data validation errors:', validationResult.errors)
      }
      if (validationResult.warnings.length > 0) {
        console.warn('Data validation warnings:', validationResult.warnings)
      }
    }

    // Return validated data with metadata
    return {
      props: {
        pettingZoos: validationResult.data.pettingZoos || [],
        warnings: validationResult.warnings,
        fallbackMode: false,
        dataQuality: {
          totalItems: rawData ? rawData.length : 0,
          validItems: validationResult.data.pettingZoos ? validationResult.data.pettingZoos.length : 0,
          hasErrors: validationResult.errors.length > 0,
          hasWarnings: validationResult.warnings.length > 0
        }
      },
    }
  } catch (error) {
    console.error('Critical error in data fetching:', error)
    
    // Determine error type for better user messaging
    const errorType = getErrorType(error)
    const userFriendlyMessage = getUserFriendlyErrorMessage(errorType, error)
    
    // In production, don't expose detailed error information
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? `${userFriendlyMessage}\n\nTechnical details: ${error.message}`
      : userFriendlyMessage

    // Return fallback data structure
    return {
      props: {
        pettingZoos: [],
        error: errorMessage,
        fallbackMode: true,
        errorType: errorType
      },
    }
  }
}

// Helper function to categorize errors
function getErrorType(error) {
  if (error.message.includes('fetch') || error.message.includes('network')) {
    return 'network'
  }
  if (error.message.includes('timeout')) {
    return 'timeout'
  }
  if (error.message.includes('GROQ') || error.message.includes('query')) {
    return 'query'
  }
  if (error.message.includes('auth') || error.message.includes('permission')) {
    return 'auth'
  }
  return 'unknown'
}

// Helper function to provide user-friendly error messages
function getUserFriendlyErrorMessage(errorType, error) {
  switch (errorType) {
    case 'network':
      return 'Unable to connect to the data service. Please check your internet connection.'
    case 'timeout':
      return 'The request took too long to complete. Please try again.'
    case 'query':
      return 'There was an issue with the data query. Our team has been notified.'
    case 'auth':
      return 'Authentication failed. Please contact support if this persists.'
    default:
      return 'An unexpected error occurred while loading petting zoo data.'
  }
}

export default Home
