import React, { useState, useCallback, useMemo, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, MarkerClusterer } from "@react-google-maps/api"

// Static libraries array to prevent reloading
const libraries = ["places"]

const DashboardMap = ({ pettingZoos = [] }) => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  })

  const [selectedZoo, setSelectedZoo] = useState(null)
  const [map, setMap] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device and handle resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile-optimized container style
  const containerStyle = {
    width: "100%",
    height: isMobile ? "300px" : "100vh",
    touchAction: "manipulation", // Improves touch performance on mobile
  }

  // Calculate center based on all zoo locations or default to US center
  const center = useMemo(() => {
    if (!pettingZoos.length) {
      return { lat: 39.8283, lng: -98.5795 } // Geographic center of US
    }

    const validLocations = pettingZoos.filter(zoo => zoo.location?.lat && zoo.location?.lng)
    if (!validLocations.length) {
      return { lat: 39.8283, lng: -98.5795 }
    }

    if (validLocations.length === 1) {
      return {
        lat: validLocations[0].location.lat,
        lng: validLocations[0].location.lng,
      }
    }

    // Calculate bounds for multiple locations
    const bounds = new window.google.maps.LatLngBounds()
    validLocations.forEach(zoo => {
      bounds.extend({ lat: zoo.location.lat, lng: zoo.location.lng })
    })

    return bounds.getCenter().toJSON()
  }, [pettingZoos])

  const onLoad = useCallback(function callback(map) {
    if (pettingZoos.length > 1) {
      const bounds = new window.google.maps.LatLngBounds()
      pettingZoos.forEach(zoo => {
        if (zoo.location?.lat && zoo.location?.lng) {
          bounds.extend({ lat: zoo.location.lat, lng: zoo.location.lng })
        }
      })
      map.fitBounds(bounds)
    }
    setMap(map)
  }, [pettingZoos])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  // Zoo-specific marker icon
  const zooMarkerIcon = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) {
      return undefined
    }

    return {
      url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <circle cx="16" cy="16" r="14" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
          <text x="16" y="20" text-anchor="middle" fill="white" font-family="Arial" font-size="16" font-weight="bold">🐾</text>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(32, 32),
      anchor: new window.google.maps.Point(16, 16),
    }
  }, [isLoaded])

  // Clustering options for dense zoo areas
  const clusterOptions = {
    imagePath: "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
    gridSize: 60,
    maxZoom: 15,
    styles: [
      {
        textColor: 'white',
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="18" fill="#4CAF50" stroke="#2E7D32" stroke-width="2"/>
          </svg>
        `),
        height: 40,
        width: 40,
        textSize: 12,
      },
      {
        textColor: 'white',
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
            <circle cx="25" cy="25" r="23" fill="#388E3C" stroke="#1B5E20" stroke-width="2"/>
          </svg>
        `),
        height: 50,
        width: 50,
        textSize: 14,
      },
      {
        textColor: 'white',
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
            <circle cx="30" cy="30" r="28" fill="#2E7D32" stroke="#1B5E20" stroke-width="2"/>
          </svg>
        `),
        height: 60,
        width: 60,
        textSize: 16,
      },
    ],
  }

  const handleMarkerClick = (zoo) => {
    setSelectedZoo(zoo)
  }

  const handleInfoWindowClose = () => {
    setSelectedZoo(null)
  }

  // Mobile-optimized map options
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
        position: isMobile ? window.google.maps.ControlPosition.RIGHT_BOTTOM : window.google.maps.ControlPosition.DEFAULT_POSITION,
      },
      mapTypeControl: false,
      scaleControl: !isMobile, // Hide scale on mobile to save space
      streetViewControl: !isMobile, // Hide street view on mobile
      rotateControl: false,
      fullscreenControl: !isMobile,
      // Improve performance on mobile
      disableDefaultUI: isMobile,
      clickableIcons: false,
    }
  }, [isLoaded, isMobile])

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={pettingZoos.length === 1 ? (isMobile ? 14 : 12) : (isMobile ? 5 : 6)}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={mapOptions}
    >
      <MarkerClusterer options={clusterOptions}>
        {(clusterer) =>
          pettingZoos
            .filter(zoo => zoo.location?.lat && zoo.location?.lng)
            .map((zoo, index) => (
              <Marker
                key={zoo._id || index}
                position={{
                  lat: zoo.location.lat,
                  lng: zoo.location.lng,
                }}
                icon={zooMarkerIcon}
                clusterer={clusterer}
                onClick={() => handleMarkerClick(zoo)}
                title={zoo.name}
              />
            ))
        }
      </MarkerClusterer>

      {selectedZoo && (
        <InfoWindow
          position={{
            lat: selectedZoo.location.lat,
            lng: selectedZoo.location.lng,
          }}
          onCloseClick={handleInfoWindowClose}
          options={{
            // Mobile-optimized info window
            maxWidth: isMobile ? 280 : 250,
            pixelOffset: isLoaded && window.google ? new window.google.maps.Size(0, isMobile ? -10 : 0) : undefined,
          }}
        >
          <div style={{
            maxWidth: isMobile ? '260px' : '230px',
            padding: isMobile ? '12px' : '8px',
            fontSize: isMobile ? '14px' : '12px'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? '18px' : '16px',
              fontWeight: 'bold',
              lineHeight: '1.2'
            }}>
              {selectedZoo.name}
            </h3>
            {selectedZoo.mainImage && (
              <img
                src={selectedZoo.mainImage}
                alt={selectedZoo.name}
                style={{
                  width: '100%',
                  height: isMobile ? '140px' : '120px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                  marginBottom: '8px',
                }}
              />
            )}
            <p style={{
              margin: '0 0 8px 0',
              fontSize: isMobile ? '14px' : '12px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              {selectedZoo.description?.substring(0, isMobile ? 120 : 100)}
              {selectedZoo.description?.length > (isMobile ? 120 : 100) ? '...' : ''}
            </p>
            {selectedZoo.rating && (
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: isMobile ? '16px' : '14px', color: '#f39c12' }}>
                  {'★'.repeat(Math.floor(selectedZoo.rating))}
                  {'☆'.repeat(5 - Math.floor(selectedZoo.rating))}
                </span>
                <span style={{
                  marginLeft: '4px',
                  fontSize: isMobile ? '13px' : '12px',
                  color: '#666'
                }}>
                  ({selectedZoo.reviewCount || 0} reviews)
                </span>
              </div>
            )}
            {selectedZoo.admissionPrice && (
              <p style={{
                margin: '0 0 8px 0',
                fontSize: isMobile ? '13px' : '12px',
                color: '#666'
              }}>
                Adult: ${selectedZoo.admissionPrice.adult} | Child: ${selectedZoo.admissionPrice.child}
              </p>
            )}
            <a
              href={`/zoo/${selectedZoo.slug?.current || selectedZoo.slug}`}
              style={{
                display: 'inline-block',
                padding: isMobile ? '10px 16px' : '6px 12px',
                backgroundColor: '#4CAF50',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: isMobile ? '14px' : '12px',
                fontWeight: 'bold',
                touchAction: 'manipulation',
                minHeight: isMobile ? '44px' : 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              View Details
            </a>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  ) : (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      color: '#666'
    }}>
      Loading map...
    </div>
  )
}

export default React.memo(DashboardMap)
