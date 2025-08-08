import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SearchBar from '../SearchBar'

// Mock Google Maps API
const mockAutocompleteService = {
  getPlacePredictions: jest.fn()
}

const mockPlacesService = {
  getDetails: jest.fn()
}

// Mock window.google
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      places: {
        AutocompleteService: jest.fn(() => mockAutocompleteService),
        PlacesService: jest.fn(() => mockPlacesService),
        PlacesServiceStatus: {
          OK: 'OK'
        }
      }
    }
  },
  writable: true
})

describe('SearchBar', () => {
  const mockOnSearch = jest.fn()
  const mockOnLocationSelect = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders both keyword and location search inputs', () => {
    render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />)
    
    expect(screen.getByTestId('keyword-search-input')).toBeInTheDocument()
    expect(screen.getByTestId('location-search-input')).toBeInTheDocument()
  })

  it('hides location search when showLocationSearch is false', () => {
    render(<SearchBar showLocationSearch={false} />)
    
    expect(screen.getByTestId('keyword-search-input')).toBeInTheDocument()
    expect(screen.queryByTestId('location-search-input')).not.toBeInTheDocument()
  })

  it('calls onSearch when keyword input changes (debounced)', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('keyword-search-input')
    fireEvent.change(input, { target: { value: 'farm zoo' } })
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast-forward time to trigger debounced call
    jest.advanceTimersByTime(300)
    
    expect(mockOnSearch).toHaveBeenCalledWith('farm zoo')
  })

  it('shows location suggestions when typing in location input', async () => {
    const mockPredictions = [
      {
        place_id: '1',
        description: 'New York, NY, USA'
      },
      {
        place_id: '2', 
        description: 'Los Angeles, CA, USA'
      }
    ]

    mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
      callback(mockPredictions, 'OK')
    })

    render(<SearchBar onLocationSelect={mockOnLocationSelect} />)
    
    const locationInput = screen.getByTestId('location-search-input')
    fireEvent.change(locationInput, { target: { value: 'New York' } })

    await waitFor(() => {
      expect(screen.getByTestId('location-suggestions')).toBeInTheDocument()
      expect(screen.getByText('New York, NY, USA')).toBeInTheDocument()
      expect(screen.getByText('Los Angeles, CA, USA')).toBeInTheDocument()
    })
  })

  it('calls onLocationSelect when a suggestion is clicked', async () => {
    const mockPredictions = [
      {
        place_id: '1',
        description: 'New York, NY, USA'
      }
    ]

    const mockPlaceDetails = {
      geometry: {
        location: {
          lat: () => 40.7128,
          lng: () => -74.0060
        }
      }
    }

    mockAutocompleteService.getPlacePredictions.mockImplementation((request, callback) => {
      callback(mockPredictions, 'OK')
    })

    mockPlacesService.getDetails.mockImplementation((request, callback) => {
      callback(mockPlaceDetails, 'OK')
    })

    render(<SearchBar onLocationSelect={mockOnLocationSelect} />)
    
    const locationInput = screen.getByTestId('location-search-input')
    fireEvent.change(locationInput, { target: { value: 'New York' } })

    await waitFor(() => {
      const suggestion = screen.getByText('New York, NY, USA')
      fireEvent.click(suggestion)
    })

    expect(mockOnLocationSelect).toHaveBeenCalledWith({
      name: 'New York, NY, USA',
      lat: 40.7128,
      lng: -74.0060,
      placeId: '1'
    })
  })

  it('clears all inputs when clear button is clicked', () => {
    render(<SearchBar onSearch={mockOnSearch} onLocationSelect={mockOnLocationSelect} />)
    
    const keywordInput = screen.getByTestId('keyword-search-input')
    const locationInput = screen.getByTestId('location-search-input')
    
    // Type in both inputs
    fireEvent.change(keywordInput, { target: { value: 'zoo search' } })
    fireEvent.change(locationInput, { target: { value: 'New York' } })
    
    // Click clear button
    const clearButton = screen.getByLabelText('Clear search')
    fireEvent.click(clearButton)
    
    expect(keywordInput.value).toBe('')
    expect(locationInput.value).toBe('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
    expect(mockOnLocationSelect).toHaveBeenCalledWith(null)
  })

  it('submits search when form is submitted', () => {
    render(<SearchBar onSearch={mockOnSearch} />)
    
    const keywordInput = screen.getByTestId('keyword-search-input')
    const form = keywordInput.closest('form')
    
    fireEvent.change(keywordInput, { target: { value: 'wildlife zoo' } })
    fireEvent.submit(form)
    
    expect(mockOnSearch).toHaveBeenCalledWith('wildlife zoo')
  })

  it('uses custom placeholder when provided', () => {
    render(<SearchBar placeholder="Find zoos near you..." />)
    
    const input = screen.getByTestId('keyword-search-input')
    expect(input).toHaveAttribute('placeholder', 'Find zoos near you...')
  })

  it('sets initial value when provided', () => {
    render(<SearchBar initialValue="initial search" />)
    
    const input = screen.getByTestId('keyword-search-input')
    expect(input.value).toBe('initial search')
  })

  it('applies correct CSS classes', () => {
    render(<SearchBar />)
    
    const container = screen.getByTestId('search-bar')
    expect(container).toHaveClass('search-bar')
  })
})