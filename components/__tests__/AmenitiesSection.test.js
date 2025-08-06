import { render, screen, fireEvent } from '@testing-library/react'
import AmenitiesSection from '../AmenitiesSection'

// Mock AmenityCard component
jest.mock('../AmenityCard', () => {
  return function MockAmenityCard({ amenity }) {
    return (
      <div data-testid="mock-amenity-card" className={amenity.isAvailable === false ? 'unavailable' : ''}>
        {amenity.name} - {amenity.category}
      </div>
    )
  }
})

describe('AmenitiesSection', () => {
  const mockAmenities = [
    {
      _id: '1',
      name: 'Parking',
      category: 'Facilities',
      isAvailable: true
    },
    {
      _id: '2',
      name: 'Gift Shop',
      category: 'Services',
      isAvailable: true
    },
    {
      _id: '3',
      name: 'Food Court',
      category: 'Services',
      isAvailable: false
    }
  ]

  it('renders amenities section with title and count', () => {
    render(<AmenitiesSection amenities={mockAmenities} title="Zoo Amenities" />)
    
    expect(screen.getByText('Zoo Amenities')).toBeInTheDocument()
    expect(screen.getByText('3 of 3 amenities')).toBeInTheDocument()
  })

  it('renders all amenities by default', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    expect(screen.getByText('Parking - Facilities')).toBeInTheDocument()
    expect(screen.getByText('Gift Shop - Services')).toBeInTheDocument()
    expect(screen.getByText('Food Court - Services')).toBeInTheDocument()
  })

  it('groups amenities by category when showing all', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    expect(screen.getByText('Facilities')).toBeInTheDocument()
    expect(screen.getByText('Services')).toBeInTheDocument()
  })

  it('filters amenities by category', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Facilities' } })
    
    expect(screen.getByText('Parking - Facilities')).toBeInTheDocument()
    expect(screen.queryByText('Gift Shop - Services')).not.toBeInTheDocument()
    expect(screen.queryByText('Food Court - Services')).not.toBeInTheDocument()
    expect(screen.getByText('1 of 3 amenities')).toBeInTheDocument()
  })

  it('filters out unavailable amenities when checkbox is unchecked', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    const checkbox = screen.getByLabelText('Show unavailable amenities')
    fireEvent.click(checkbox)
    
    expect(screen.getByText('Parking - Facilities')).toBeInTheDocument()
    expect(screen.getByText('Gift Shop - Services')).toBeInTheDocument()
    expect(screen.queryByText('Food Court - Services')).not.toBeInTheDocument()
    expect(screen.getByText('2 of 3 amenities')).toBeInTheDocument()
  })

  it('shows no results message when filters match no amenities', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Entertainment' } })
    
    expect(screen.getByText('No amenities match the selected filters.')).toBeInTheDocument()
    expect(screen.getByText('Reset Filters')).toBeInTheDocument()
  })

  it('resets filters when reset button is clicked', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    // Apply filters
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Facilities' } })
    
    const checkbox = screen.getByLabelText('Show unavailable amenities')
    fireEvent.click(checkbox)
    
    // Click reset
    const resetButton = screen.getByText('Reset Filters')
    fireEvent.click(resetButton)
    
    // Check that all amenities are shown again
    expect(screen.getByText('3 of 3 amenities')).toBeInTheDocument()
    expect(checkbox).toBeChecked()
  })

  it('handles empty amenities array', () => {
    render(<AmenitiesSection amenities={[]} />)
    
    expect(screen.getByText('No amenities information available yet.')).toBeInTheDocument()
  })

  it('handles undefined amenities prop', () => {
    render(<AmenitiesSection />)
    
    expect(screen.getByText('No amenities information available yet.')).toBeInTheDocument()
  })

  it('uses default title when none provided', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    expect(screen.getByText('Amenities & Facilities')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<AmenitiesSection amenities={mockAmenities} />)
    
    const section = screen.getByTestId('amenities-section')
    expect(section).toHaveClass('amenities-section')
  })
})