import React from 'react'
import { render, screen } from '@testing-library/react'
import Map from '../Map'

// Mock window.google.maps
const mockGoogleMaps = {
  maps: {
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
      getCenter: jest.fn(() => ({ toJSON: () => ({ lat: 40.7128, lng: -74.0060 }) })),
    })),
    Size: jest.fn(),
    Point: jest.fn(),
    DirectionsService: jest.fn(),
    TravelMode: { DRIVING: 'DRIVING' },
    DirectionsStatus: { OK: 'OK' },
  },
}

// Set up global window.google
Object.defineProperty(window, 'google', {
  value: mockGoogleMaps,
  writable: true,
})

// Mock Google Maps API
jest.mock('@react-google-maps/api', () => ({
  useJsApiLoader: jest.fn(() => ({ isLoaded: false })),
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  Marker: () => <div data-testid="marker" />,
  InfoWindow: ({ children }) => <div data-testid="info-window">{children}</div>,
  DirectionsService: () => <div data-testid="directions-service" />,
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
}))

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
}
global.navigator.geolocation = mockGeolocation

describe('Map', () => {
  const mockLocation = {
    lat: 40.7128,
    lng: -74.0060,
  }

  const mockProps = {
    location: mockLocation,
    zooName: 'Happy Farm Zoo',
    address: '123 Farm Road, New York, NY',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state when map is not loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<Map {...mockProps} />)
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('renders error message when location is invalid', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<Map location={null} zooName="Test Zoo" />)
    expect(screen.getByText('Location information not available')).toBeInTheDocument()
  })

  it('renders error message when location coordinates are missing', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<Map location={{}} zooName="Test Zoo" />)
    expect(screen.getByText('Location information not available')).toBeInTheDocument()
  })

  it('handles missing optional props gracefully', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<Map location={mockLocation} />)
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('renders map when loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: true })
    
    render(<Map {...mockProps} />)
    expect(screen.getByTestId('google-map')).toBeInTheDocument()
  })
})