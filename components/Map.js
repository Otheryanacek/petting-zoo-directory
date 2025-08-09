import React, { useState, useCallback, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsService, DirectionsRenderer } from "@react-google-maps/api"

// Static libraries array to prevent reloading
const libraries = ["places"]

const Map = ({ location, zooName, address, showDirections = false }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [map, setMap] = useState(null)
  const [showInfo, setShowInfo] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [directions, setDirections] = useState(null)
  const [directionsError, setDirectionsError] = useState(null)

  // Detect mobile device
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Responsive container style
  const containerStyle = {
    width: "100%",
    height: isMobile ? "280px" : "400px",
    borderRadius: "8px",
    overflow: "hidden",
    touchAction: "manipulation", // Improves touch performance
  }

  const center = {
    lat: location?.lat || 0,
    lng: location?.lng || 0,
  }

  const onLoad = useCallback(function callback(map) {
    // Don't auto-fit bounds for single location, just center on the zoo
    map.setCenter(center)
    map.setZoom(15)
    setMap(map)
  }, [center])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  // Get user's current location for directions
  useEffect(() => {
    if (showDirections && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.warn("Could not get user location:", error)
        }
      )
    }
  }, [showDirections])

  // Zoo-specific marker icon (larger for individual zoo display)
  const zooMarkerIcon = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return undefined
    }
    
    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg width="48" height="48" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" fill="#4CAF50" stroke="#2E7D32" stroke-width="3"/>
          <text x="24" y="30" text-anchor="middle" fill="white" font-family="Arial" font-size="20" font-weight="bold">🐾</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(48, 48),
      anchor: new window.google.maps.Point(24, 24),
    }
  }, [isLoaded])

  const handleMarkerClick = () => {
    setShowInfo(!showInfo)
  }

  const handleGetDirections = () => {
    if (userLocation && location && isLoaded && window.google) {
      const directionsService = new window.google.maps.DirectionsService()
      
      directionsService.route(
        {
          origin: userLocation,
          destination: { lat: location.lat, lng: location.lng },
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result)
            setDirectionsError(null)
          } else {
            setDirectionsError("Could not calculate directions")
            console.error("Directions request failed:", status)
          }
        }
      )
    }
  }

  const handleOpenInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}&destination_place_id=${encodeURIComponent(zooName || 'Petting Zoo')}`
    window.open(url, '_blank')
  }

  const mapOptions = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return {}
    }
    
    return {
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
      // Mobile-specific optimizations
      gestureHandling: isMobile ? "cooperative" : "auto",
      zoomControl: true,
      zoomControlOptions: {
        position: isMobile ? window.google.maps.ControlPosition.RIGHT_TOP : window.google.maps.ControlPosition.DEFAULT_POSITION,
      },
      mapTypeControl: false,
      scaleControl: !isMobile, // Hide scale on mobile to save space
      streetViewControl: !isMobile, // Hide street view control on mobile
      rotateControl: false,
      fullscreenControl: !isMobile,
      // Improve performance on mobile
      disableDefaultUI: isMobile,
      clickableIcons: false,
      // Better touch handling
      draggable: true,
      scrollwheel: !isMobile, // Disable scroll zoom on mobile to prevent accidental zooming
      disableDoubleClickZoom: false,
    }
  }, [isLoaded, isMobile])

  if (!location?.lat || !location?.lng) {
    return (
      <div style={{
        ...containerStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: '1px solid #ddd',
      }}>
        Location information not available
      </div>
    )
  }

  return isLoaded ? (
    <div style={{ position: 'relative' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={isMobile ? 14 : 15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <Marker
          position={{ lat: location.lat, lng: location.lng }}
          icon={zooMarkerIcon}
          onClick={handleMarkerClick}
          title={zooName}
        />

        {showInfo && (
          <InfoWindow
            position={{ lat: location.lat, lng: location.lng }}
            onCloseClick={() => setShowInfo(false)}
            options={{
              maxWidth: isMobile ? 250 : 200,
              pixelOffset: isLoaded && window.google ? new window.google.maps.Size(0, isMobile ? -10 : 0) : undefined,
            }}
          >
            <div style={{ 
              maxWidth: isMobile ? '230px' : '180px', 
              padding: isMobile ? '12px' : '8px' 
            }}>
              <h4 style={{ 
                margin: '0 0 8px 0', 
                fontSize: isMobile ? '16px' : '14px', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}>
                {zooName}
              </h4>
              {address && (
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: isMobile ? '13px' : '12px', 
                  color: '#666',
                  lineHeight: '1.3'
                }}>
                  {address}
                </p>
              )}
              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '10px' : '8px', 
                flexWrap: 'wrap' 
              }}>
                <button
                  onClick={handleOpenInGoogleMaps}
                  style={{
                    padding: isMobile ? '8px 12px' : '4px 8px',
                    backgroundColor: '#4285f4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: isMobile ? '13px' : '11px',
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    minHeight: isMobile ? '36px' : 'auto',
                  }}
                >
                  Open in Maps
                </button>
                {userLocation && (
                  <button
                    onClick={handleGetDirections}
                    style={{
                      padding: isMobile ? '8px 12px' : '4px 8px',
                      backgroundColor: '#34a853',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: isMobile ? '13px' : '11px',
                      cursor: 'pointer',
                      touchAction: 'manipulation',
                      minHeight: isMobile ? '36px' : 'auto',
                    }}
                  >
                    Get Directions
                  </button>
                )}
              </div>
              {directionsError && (
                <p style={{ 
                  margin: '4px 0 0 0', 
                  fontSize: isMobile ? '12px' : '10px', 
                  color: '#d93025' 
                }}>
                  {directionsError}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: false,
              polylineOptions: {
                strokeColor: '#4285f4',
                strokeWeight: 4,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Mobile-friendly action buttons */}
      {isMobile && (
        <div style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <button
            onClick={handleOpenInGoogleMaps}
            style={{
              padding: '12px',
              backgroundColor: '#4285f4',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Open in Google Maps"
          >
            🗺️
          </button>
          {userLocation && (
            <button
              onClick={handleGetDirections}
              style={{
                padding: '12px',
                backgroundColor: '#34a853',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                fontSize: '16px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Get Directions"
            >
              🧭
            </button>
          )}
        </div>
      )}
    </div>
  ) : (
    <div style={{
      ...containerStyle,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      color: '#666',
      border: '1px solid #ddd',
    }}>
      Loading map...
    </div>
  )
}

export default React.memo(Map)
