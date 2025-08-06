import { render, screen } from '@testing-library/react'
import AmenityCard from '../AmenityCard'

describe('AmenityCard', () => {
  const mockAmenity = {
    name: 'Parking',
    description: 'Free parking available for all visitors',
    icon: '🅿️',
    category: 'Facilities',
    isAvailable: true
  }

  it('renders amenity information correctly', () => {
    render(<AmenityCard amenity={mockAmenity} />)
    
    expect(screen.getByText('Parking')).toBeInTheDocument()
    expect(screen.getByText('Free parking available for all visitors')).toBeInTheDocument()
    expect(screen.getByText('Facilities')).toBeInTheDocument()
    expect(screen.getByText('🅿️')).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalAmenity = {
      name: 'Gift Shop'
    }

    render(<AmenityCard amenity={minimalAmenity} />)
    
    expect(screen.getByText('Gift Shop')).toBeInTheDocument()
    expect(screen.getByText('🛍️')).toBeInTheDocument() // Default icon
  })

  it('shows unavailable badge when amenity is not available', () => {
    const unavailableAmenity = {
      name: 'Food Court',
      isAvailable: false
    }

    render(<AmenityCard amenity={unavailableAmenity} />)
    
    expect(screen.getByText('Food Court')).toBeInTheDocument()
    expect(screen.getByText('Currently Unavailable')).toBeInTheDocument()
  })

  it('applies unavailable class when amenity is not available', () => {
    const unavailableAmenity = {
      name: 'Playground',
      isAvailable: false
    }

    render(<AmenityCard amenity={unavailableAmenity} />)
    
    const card = screen.getByTestId('amenity-card')
    expect(card).toHaveClass('amenity-card', 'unavailable')
  })

  it('uses default icon for common amenities', () => {
    const amenityWithoutIcon = {
      name: 'Restrooms'
    }

    render(<AmenityCard amenity={amenityWithoutIcon} />)
    
    expect(screen.getByText('🚻')).toBeInTheDocument()
  })

  it('uses fallback icon for unknown amenities', () => {
    const unknownAmenity = {
      name: 'Unknown Facility'
    }

    render(<AmenityCard amenity={unknownAmenity} />)
    
    expect(screen.getByText('✨')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<AmenityCard amenity={mockAmenity} />)
    
    const card = screen.getByTestId('amenity-card')
    expect(card).toHaveClass('amenity-card')
    expect(card).not.toHaveClass('unavailable')
  })
})