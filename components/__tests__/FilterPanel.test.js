import { render, screen, fireEvent } from '@testing-library/react'
import FilterPanel from '../FilterPanel'

describe('FilterPanel', () => {
  const mockProperties = [
    {
      _id: '1',
      name: 'Farm Zoo',
      zooType: 'Farm Petting Zoo',
      animals: [
        { species: 'Goat', category: 'Farm Animals' },
        { species: 'Sheep', category: 'Farm Animals' }
      ],
      amenities: [
        { name: 'Parking' },
        { name: 'Restrooms' }
      ],
      location: { lat: 40.7128, lng: -74.0060 },
      admissionPrice: { adult: 15 },
      reviews: [{ rating: 4, isApproved: true }]
    },
    {
      _id: '2',
      name: 'Wildlife Sanctuary',
      zooType: 'Wildlife Sanctuary',
      animals: [
        { species: 'Deer', category: 'Wild Animals' }
      ],
      amenities: [
        { name: 'Gift Shop' }
      ],
      location: { lat: 40.7589, lng: -73.9851 },
      pricePerNight: 8,
      reviews: [{ rating: 5, isApproved: true }]
    }
  ]

  const mockOnFiltersChange = jest.fn()
  const mockOnToggle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders filter toggle button', () => {
    render(<FilterPanel properties={mockProperties} />)
    
    expect(screen.getByTestId('filter-toggle')).toBeInTheDocument()
    expect(screen.getByText('Filters')).toBeInTheDocument()
  })

  it('shows filter count when filters are active', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        onFiltersChange={mockOnFiltersChange}
        isOpen={true}
      />
    )
    
    // Select a zoo type filter
    const farmZooCheckbox = screen.getByTestId('zoo-type-Farm Petting Zoo')
    fireEvent.click(farmZooCheckbox)
    
    expect(screen.getByText('1')).toBeInTheDocument() // Filter count badge
  })

  it('calls onToggle when toggle button is clicked', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        onToggle={mockOnToggle}
      />
    )
    
    const toggleButton = screen.getByTestId('filter-toggle')
    fireEvent.click(toggleButton)
    
    expect(mockOnToggle).toHaveBeenCalled()
  })

  it('shows filter content when isOpen is true', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByText('Filter Results')).toBeInTheDocument()
    expect(screen.getByText('Zoo Type')).toBeInTheDocument()
  })

  it('hides filter content when isOpen is false', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={false}
      />
    )
    
    expect(screen.queryByText('Filter Results')).not.toBeInTheDocument()
  })

  it('renders zoo type filters based on properties', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByTestId('zoo-type-Farm Petting Zoo')).toBeInTheDocument()
    expect(screen.getByTestId('zoo-type-Wildlife Sanctuary')).toBeInTheDocument()
  })

  it('renders animal type filters based on properties', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByTestId('animal-type-Goat')).toBeInTheDocument()
    expect(screen.getByTestId('animal-type-Sheep')).toBeInTheDocument()
    expect(screen.getByTestId('animal-type-Deer')).toBeInTheDocument()
  })

  it('renders amenity filters based on properties', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByTestId('amenity-Parking')).toBeInTheDocument()
    expect(screen.getByTestId('amenity-Restrooms')).toBeInTheDocument()
    expect(screen.getByTestId('amenity-Gift Shop')).toBeInTheDocument()
  })

  it('shows distance filters when userLocation is provided', () => {
    const userLocation = { lat: 40.7128, lng: -74.0060 }
    
    render(
      <FilterPanel 
        properties={mockProperties}
        userLocation={userLocation}
        isOpen={true}
      />
    )
    
    expect(screen.getByText('Distance')).toBeInTheDocument()
    expect(screen.getByTestId('distance-10')).toBeInTheDocument()
    expect(screen.getByTestId('distance-25')).toBeInTheDocument()
  })

  it('hides distance filters when userLocation is not provided', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.queryByText('Distance')).not.toBeInTheDocument()
  })

  it('renders price range filters', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByText('Price Range')).toBeInTheDocument()
    expect(screen.getByTestId('price-free')).toBeInTheDocument()
    expect(screen.getByTestId('price-low')).toBeInTheDocument()
    expect(screen.getByTestId('price-medium')).toBeInTheDocument()
  })

  it('renders rating filters', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        isOpen={true}
      />
    )
    
    expect(screen.getByText('Minimum Rating')).toBeInTheDocument()
    expect(screen.getByTestId('rating-4plus')).toBeInTheDocument()
    expect(screen.getByTestId('rating-3plus')).toBeInTheDocument()
  })

  it('calls onFiltersChange when filters are updated', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        onFiltersChange={mockOnFiltersChange}
        isOpen={true}
      />
    )
    
    const farmZooCheckbox = screen.getByTestId('zoo-type-Farm Petting Zoo')
    fireEvent.click(farmZooCheckbox)
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        zooTypes: ['Farm Petting Zoo']
      })
    )
  })

  it('clears all filters when clear all button is clicked', () => {
    render(
      <FilterPanel 
        properties={mockProperties}
        onFiltersChange={mockOnFiltersChange}
        isOpen={true}
      />
    )
    
    // Select some filters first
    const farmZooCheckbox = screen.getByTestId('zoo-type-Farm Petting Zoo')
    fireEvent.click(farmZooCheckbox)
    
    // Clear all filters
    const clearButton = screen.getByTestId('clear-all-filters')
    fireEvent.click(clearButton)
    
    expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
      zooTypes: [],
      animalTypes: [],
      amenities: [],
      distance: 'all',
      priceRange: 'all',
      rating: 'all'
    })
  })

  it('applies correct CSS classes', () => {
    render(<FilterPanel properties={mockProperties} isOpen={true} />)
    
    const panel = screen.getByTestId('filter-panel')
    expect(panel).toHaveClass('filter-panel', 'open')
  })

  it('applies closed class when isOpen is false', () => {
    render(<FilterPanel properties={mockProperties} isOpen={false} />)
    
    const panel = screen.getByTestId('filter-panel')
    expect(panel).toHaveClass('filter-panel', 'closed')
  })
})