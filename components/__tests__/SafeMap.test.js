import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SafeMap from '../SafeMap'

// Mock DashboardMap component
jest.mock('../DashboardMap', () => {
  return function MockDashboardMap({ pettingZoos }) {
    if (pettingZoos.some(zoo => zoo.name === 'ErrorZoo')) {
      throw new Error('Map rendering error')
    }
    return <div data-testid="dashboard-map">Map with {pettingZoos.length} zoos</div>
  }
})

// Mock validation utilities
jest.mock('../../utils/validation', () => ({
  validateLocationData: jest.fn(),
  sanitizeArrayData: jest.fn()
}))

const { validateLocationData, sanitizeArrayData } = require('../../utils/validation')

// Mock environment variable
const originalEnv = process.env
beforeEach(() => {
  jest.resetModules()
  process.env = { ...originalEnv }
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = 'test-api-key'
  jest.clearAllMocks()
})

afterEach(() => {
  process.env = originalEnv
})

describe('SafeMap', () => {
  const mockValidZoo = {
    _id: '1',
    name: 'Test Zoo',
    location: { lat: 40.7128, lng: -74.0060 }
  }

  const mockInvalidZoo = {
    _id: '2',
    name: 'Invalid Zoo',
    location: { lat: 'invalid', lng: 'invalid' }
  }

  it('renders map with valid zoo data', () => {
    sanitizeArrayData.mockReturnValue([mockValidZoo])
    validateLocationData.mockReturnValue({
      isValid: true,
      data: mockValidZoo.location,
      errors: [],
      warnings: []
    })

    render(<SafeMap pettingZoos={[mockValidZoo]} />)
    
    expect(screen.getByTestId('dashboard-map')).toBeInTheDocument()
    expect(screen.getByText('Map with 1 zoos')).toBeInTheDocument()
  })

  it('filters out zoos with invalid location data', () => {
    sanitizeArrayData.mockReturnValue([mockValidZoo, mockInvalidZoo])
    validateLocationData
      .mockReturnValueOnce({
        isValid: true,
        data: mockValidZoo.location,
        errors: [],
        warnings: []
      })
      .mockReturnValueOnce({
        isValid: false,
        data: null,
        errors: ['Invalid coordinates'],
        warnings: []
      })

    render(<SafeMap pettingZoos={[mockValidZoo, mockInvalidZoo]} />)
    
    // Should still render map but with zoo without location set to null
    expect(screen.getByTestId('dashboard-map')).toBeInTheDocument()
  })

  it('shows error when Google Maps API key is missing', () => {
    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    render(<SafeMap pettingZoos={[]} />)
    
    expect(screen.getByText('Map Unavailable')).toBeInTheDocument()
    expect(screen.getByText(/Google Maps API key is not configured/)).toBeInTheDocument()
  })

  it('handles map rendering errors with error boundary', async () => {
    const errorZoo = { ...mockValidZoo, name: 'ErrorZoo' }
    
    sanitizeArrayData.mockReturnValue([errorZoo])
    validateLocationData.mockReturnValue({
      isValid: true,
      data: errorZoo.location,
      errors: [],
      warnings: []
    })

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<SafeMap pettingZoos={[errorZoo]} />)
    
    await waitFor(() => {
      expect(screen.getByText('Map Unavailable')).toBeInTheDocument()
      expect(screen.getByText(/Map failed to load or render/)).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('shows retry button and handles retry attempts', async () => {
    const errorZoo = { ...mockValidZoo, name: 'ErrorZoo' }
    
    sanitizeArrayData.mockReturnValue([errorZoo])
    validateLocationData.mockReturnValue({
      isValid: true,
      data: errorZoo.location,
      errors: [],
      warnings: []
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<SafeMap pettingZoos={[errorZoo]} retryAttempts={2} retryDelay={100} />)
    
    await waitFor(() => {
      expect(screen.getByText(/Try Again \(2 attempts left\)/)).toBeInTheDocument()
    })

    const retryButton = screen.getByText(/Try Again/)
    fireEvent.click(retryButton)

    // Should show retrying state
    await waitFor(() => {
      expect(screen.getByText('Loading map...')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Try Again \(1 attempts left\)/)).toBeInTheDocument()
    }, { timeout: 300 })

    consoleSpy.mockRestore()
  })

  it('uses custom fallback component', () => {
    const CustomFallback = ({ error }) => (
      <div>Custom Error: {error.message}</div>
    )

    delete process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    render(
      <SafeMap 
        pettingZoos={[]} 
        fallbackComponent={CustomFallback}
      />
    )
    
    expect(screen.getByText(/Custom Error:/)).toBeInTheDocument()
  })

  it('calls onError callback when errors occur', async () => {
    const onError = jest.fn()
    const errorZoo = { ...mockValidZoo, name: 'ErrorZoo' }
    
    sanitizeArrayData.mockReturnValue([errorZoo])
    validateLocationData.mockReturnValue({
      isValid: true,
      data: errorZoo.location,
      errors: [],
      warnings: []
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(<SafeMap pettingZoos={[errorZoo]} onError={onError} />)
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'map',
          message: 'Map failed to load or render'
        })
      )
    })

    consoleSpy.mockRestore()
  })

  it('shows error details when showErrorDetails is true', async () => {
    const errorZoo = { ...mockValidZoo, name: 'ErrorZoo' }
    
    sanitizeArrayData.mockReturnValue([errorZoo])
    validateLocationData.mockReturnValue({
      isValid: true,
      data: errorZoo.location,
      errors: [],
      warnings: []
    })

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <SafeMap 
        pettingZoos={[errorZoo]} 
        showErrorDetails={true}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Technical Details')).toBeInTheDocument()
    })

    consoleSpy.mockRestore()
  })

  it('handles empty pettingZoos array', () => {
    sanitizeArrayData.mockReturnValue([])

    render(<SafeMap pettingZoos={[]} />)
    
    expect(screen.getByTestId('dashboard-map')).toBeInTheDocument()
    expect(screen.getByText('Map with 0 zoos')).toBeInTheDocument()
  })

  it('handles null pettingZoos prop', () => {
    sanitizeArrayData.mockReturnValue([])

    render(<SafeMap pettingZoos={null} />)
    
    expect(screen.getByTestId('dashboard-map')).toBeInTheDocument()
  })
})