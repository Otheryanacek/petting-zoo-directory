import {
  calculateDistance,
  getPrice,
  calculateAverageRating,
  applyFilters,
  getFilterSummary
} from '../filterUtils'

describe('filterUtils', () => {
  describe('calculateDistance', () => {
    it('calculates distance between two points correctly', () => {
      // Distance between New York and Los Angeles (approximately 2445 miles)
      const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437)
      expect(distance).toBeCloseTo(2445, -1) // Within 10 miles
    })

    it('returns 0 for same coordinates', () => {
      const distance = calculateDistance(40.7128, -74.0060, 40.7128, -74.0060)
      expect(distance).toBeCloseTo(0, 2)
    })
  })

  describe('getPrice', () => {
    it('returns adult admission price when available', () => {
      const property = {
        admissionPrice: { adult: 15, child: 10 }
      }
      expect(getPrice(property)).toBe(15)
    })

    it('returns pricePerNight when admission price not available', () => {
      const property = {
        pricePerNight: 20
      }
      expect(getPrice(property)).toBe(20)
    })

    it('returns 0 when no price available', () => {
      const property = {}
      expect(getPrice(property)).toBe(0)
    })
  })

  describe('calculateAverageRating', () => {
    it('calculates average rating correctly', () => {
      const reviews = [
        { rating: 4, isApproved: true },
        { rating: 5, isApproved: true },
        { rating: 3, isApproved: true }
      ]
      expect(calculateAverageRating(reviews)).toBe(4)
    })

    it('excludes unapproved reviews', () => {
      const reviews = [
        { rating: 4, isApproved: true },
        { rating: 1, isApproved: false },
        { rating: 5, isApproved: true }
      ]
      expect(calculateAverageRating(reviews)).toBe(4.5)
    })

    it('returns 0 for empty reviews', () => {
      expect(calculateAverageRating([])).toBe(0)
      expect(calculateAverageRating(null)).toBe(0)
    })

    it('returns 0 when no valid reviews', () => {
      const reviews = [
        { rating: null, isApproved: true },
        { comment: 'Great!', isApproved: true }
      ]
      expect(calculateAverageRating(reviews)).toBe(0)
    })
  })

  describe('applyFilters', () => {
    const mockProperties = [
      {
        _id: '1',
        name: 'Farm Zoo',
        zooType: 'Farm Petting Zoo',
        animals: [
          { species: 'Goat', category: 'Farm Animals' }
        ],
        amenities: [
          { name: 'Parking' }
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

    it('filters by zoo type', () => {
      const filters = { zooTypes: ['Farm Petting Zoo'] }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Farm Zoo')
    })

    it('filters by animal type', () => {
      const filters = { animalTypes: ['Goat'] }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Farm Zoo')
    })

    it('filters by amenity', () => {
      const filters = { amenities: ['Gift Shop'] }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Wildlife Sanctuary')
    })

    it('filters by distance when user location provided', () => {
      const userLocation = { lat: 40.7128, lng: -74.0060 }
      const filters = { distance: '1' } // Very small distance
      const result = applyFilters(mockProperties, filters, userLocation)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Farm Zoo') // Exact match with user location
    })

    it('filters by price range', () => {
      const filters = { priceRange: 'low' } // Under £10
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Wildlife Sanctuary')
    })

    it('filters by rating', () => {
      const filters = { rating: '5+' }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Wildlife Sanctuary')
    })

    it('applies multiple filters', () => {
      const filters = {
        zooTypes: ['Farm Petting Zoo'],
        animalTypes: ['Goat'],
        priceRange: 'medium' // £10-£25
      }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Farm Zoo')
    })

    it('returns empty array when no properties match', () => {
      const filters = { zooTypes: ['Nonexistent Type'] }
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(0)
    })

    it('returns all properties when no filters applied', () => {
      const filters = {}
      const result = applyFilters(mockProperties, filters)
      
      expect(result).toHaveLength(2)
    })
  })

  describe('getFilterSummary', () => {
    it('returns summary for no active filters', () => {
      const filters = {
        zooTypes: [],
        animalTypes: [],
        amenities: [],
        distance: 'all',
        priceRange: 'all',
        rating: 'all'
      }
      const summary = getFilterSummary(filters, 10, 10)
      expect(summary).toBe('Showing all 10 petting zoos')
    })

    it('returns summary for active filters', () => {
      const filters = {
        zooTypes: ['Farm Petting Zoo'],
        animalTypes: ['Goat', 'Sheep'],
        amenities: [],
        distance: '25',
        priceRange: 'low',
        rating: '4+'
      }
      const summary = getFilterSummary(filters, 20, 5)
      expect(summary).toBe('Showing 5 of 20 petting zoos (1 zoo type, 2 animal types, within 25 miles, under £10, 4+ stars)')
    })

    it('handles singular vs plural correctly', () => {
      const filters = {
        zooTypes: ['Farm Petting Zoo'],
        animalTypes: ['Goat'],
        amenities: ['Parking'],
        distance: 'all',
        priceRange: 'all',
        rating: 'all'
      }
      const summary = getFilterSummary(filters, 10, 3)
      expect(summary).toBe('Showing 3 of 10 petting zoos (1 zoo type, 1 animal type, 1 amenity)')
    })
  })
})