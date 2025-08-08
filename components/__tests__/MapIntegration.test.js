import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DashboardMap from '../DashboardMap'
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
  useJsApiLoader: jest.fn(() => ({ isLoaded: true })),
  GoogleMap: ({ children, onClick }) => (
    <div data-testid="google-map" onClick={onClick}>
      {children}
    </div>
  ),
  Marker: ({ onClick, title }) => (
    <div data-testid="marker" onClick={onClick} title={title} />
  ),
  InfoWindow: ({ children, onCloseClick }) => (
    <div data-testid="info-window">
      {children}
      <button onClick={onCloseClick}>Close</button>
    </div>
  ),
  MarkerClusterer: ({ children }) => (
    <div data-testid="marker-clusterer">{children}</div>
  ),
  DirectionsRenderer: () => <div data-testid="directions-renderer" />,
}))

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn((success) => {
    success({
      coords: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
    })
  }),
}
global.navigator.geolocation = mockGeolocation

describe('Map Integration Tests', () => {
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
    jest.clearAllMocks()
  })

  describe('DashboardMap Integration', () => {
    it('renders map with zoo markers and handles marker clicks', () => {
      render(<DashboardMap pettingZoos={mockPettingZoos} />)
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
      expect(screen.getByTestId('marker-clusterer')).toBeInTheDocument()
      
      // Should render markers for each zoo
      const markers = screen.getAllByTestId('marker')
      expect(markers).toHaveLength(2)
      
      // Check marker titles
      expect(markers[0]).toHaveAttribute('title', 'Happy Farm Zoo')
      expect(markers[1]).toHaveAttribute('title', 'Sunny Meadows')
    })

    it('shows info window when marker is clicked', () => {
      render(<DashboardMap pettingZoos={mockPettingZoos} />)
      
      const firstMarker = screen.getAllByTestId('marker')[0]
      fireEvent.click(firstMarker)
      
      // Info window should appear
      expect(screen.getByTestId('info-window')).toBeInTheDocument()
    })

    it('handles empty zoo list gracefully', () => {
      render(<DashboardMap pettingZoos={[]} />)
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
      expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
    })
  })

  describe('Individual Map Integration', () => {
    const mockLocation = { lat: 40.7128, lng: -74.0060 }
    const mockProps = {
      location: mockLocation,
      zooName: 'Happy Farm Zoo',
      address: '123 Farm Road, New York, NY',
    }

    it('renders individual zoo map with marker', () => {
      render(<Map {...mockProps} />)
      
      expect(screen.getByTestId('google-map')).toBeInTheDocument()
      expect(screen.getByTestId('marker')).toBeInTheDocument()
    })

    it('shows info window when marker is clicked', () => {
      render(<Map {...mockProps} />)
      
      const marker = screen.getByTestId('marker')
      fireEvent.click(marker)
      
      expect(screen.getByTestId('info-window')).toBeInTheDocument()
      expect(screen.getByText('Happy Farm Zoo')).toBeInTheDocument()
    })

    it('handles directions functionality', () => {
      render(<Map {...mockProps} showDirections={true} />)
      
      const marker = screen.getByTestId('marker')
      fireEvent.click(marker)
      
      // Should show directions button in info window
      expect(screen.getByText('Get Directions')).toBeInTheDocument()
    })

    it('handles invalid location gracefully', () => {
      render(<Map location={null} zooName="Test Zoo" />)
      
      expect(screen.getByText('Location information not available')).toBeInTheDocument()
      expect(screen.queryByTestId('google-map')).not.toBeInTheDocument()
    })
  })

  describe('Mobile Responsiveness', () => {
    beforeEach(() => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 500,
      })
    })

    afterEach(() => {
      // Reset window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })
    })

    it('renders mobile-friendly controls on individual map', () => {
      render(<Map location={{ lat: 40.7128, lng: -74.0060 }} zooName="Test Zoo" />)
      
      // Mobile action buttons should be present
      expect(screen.getByTitle('Open in Google Maps')).toBeInTheDocument()
    })
  })
})