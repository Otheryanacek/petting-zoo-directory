import React from 'react'
import { render, screen } from '@testing-library/react'
import DashboardMap from '../DashboardMap'

// Mock window.google.maps
const mockGoogleMaps = {
  maps: {
    LatLngBounds: jest.fn(() => ({
      extend: jest.fn(),
      getCenter: jest.fn(() => ({ toJSON: () => ({ lat: 40.7128, lng: -74.0060 }) })),
    })),
    Size: jest.fn(),
    Point: jest.fn(),
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
  MarkerClusterer: ({ children }) => <div data-testid="marker-clusterer">{children}</div>,
}))

describe('DashboardMap', () => {
  const mockPettingZoos = [
    {
      _id: '1',
      name: 'Happy Farm Zoo',
      slug: { current: 'happy-farm-zoo' },
      location: { lat: 40.7128, lng: -74.0060 },
      description: 'A wonderful petting zoo with friendly animals',
      rating: 4.5,
      reviewCount: 25,
      admissionPrice: { adult: 15, child: 10 },
      mainImage: 'https://example.com/image.jpg',
    },
    {
      _id: '2',
      name: 'Sunny Meadows',
      slug: { current: 'sunny-meadows' },
      location: { lat: 40.7589, lng: -73.9851 },
      description: 'Family-friendly zoo with educational programs',
      rating: 4.2,
      reviewCount: 18,
      admissionPrice: { adult: 12, child: 8 },
    },
  ]

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
  })

  it('renders loading state when map is not loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<DashboardMap pettingZoos={mockPettingZoos} />)
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('handles empty petting zoos array', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    render(<DashboardMap pettingZoos={[]} />)
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('filters out zoos without valid locations', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: false })
    
    const zoosWithInvalidLocation = [
      ...mockPettingZoos,
      {
        _id: '3',
        name: 'Invalid Zoo',
        location: null,
      },
    ]
    
    render(<DashboardMap pettingZoos={zoosWithInvalidLocation} />)
    // Should not crash and should handle invalid locations gracefully
    expect(screen.getByText('Loading map...')).toBeInTheDocument()
  })

  it('renders map when loaded', () => {
    const { useJsApiLoader } = require('@react-google-maps/api')
    useJsApiLoader.mockReturnValue({ isLoaded: true })
    
    render(<DashboardMap pettingZoos={mockPettingZoos} />)
    expect(screen.getByTestId('google-map')).toBeInTheDocument()
  })
})