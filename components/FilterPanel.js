import { useState, useEffect } from "react"

const FilterPanel = ({ 
  properties = [],
  onFiltersChange,
  userLocation = null,
  isOpen = false,
  onToggle
}) => {
  const [filters, setFilters] = useState({
    zooTypes: [],
    animalTypes: [],
    amenities: [],
    distance: 'all', // 'all', '10', '25', '50', '100'
    priceRange: 'all', // 'all', 'free', 'low', 'medium', 'high'
    rating: 'all' // 'all', '4+', '3+', '2+'
  })

  // Extract unique values from properties for filter options
  const getFilterOptions = () => {
    const zooTypes = new Set()
    const animalTypes = new Set()
    const amenities = new Set()

    properties.forEach(property => {
      // Zoo types
      const zooType = property.zooType || property.propertyType
      if (zooType) zooTypes.add(zooType)

      // Animal types (from animals array)
      if (property.animals) {
        property.animals.forEach(animal => {
          if (animal.species) animalTypes.add(animal.species)
          if (animal.category) animalTypes.add(animal.category)
        })
      }

      // Amenities
      if (property.amenities) {
        property.amenities.forEach(amenity => {
          if (amenity.name) amenities.add(amenity.name)
        })
      }
    })

    return {
      zooTypes: Array.from(zooTypes).sort(),
      animalTypes: Array.from(animalTypes).sort(),
      amenities: Array.from(amenities).sort()
    }
  }

  const filterOptions = getFilterOptions()

  // Handle filter changes
  const handleFilterChange = (filterType, value, checked) => {
    setFilters(prev => {
      const newFilters = { ...prev }
      
      if (filterType === 'zooTypes' || filterType === 'animalTypes' || filterType === 'amenities') {
        if (checked) {
          newFilters[filterType] = [...prev[filterType], value]
        } else {
          newFilters[filterType] = prev[filterType].filter(item => item !== value)
        }
      } else {
        newFilters[filterType] = value
      }
      
      return newFilters
    })
  }

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      zooTypes: [],
      animalTypes: [],
      amenities: [],
      distance: 'all',
      priceRange: 'all',
      rating: 'all'
    })
  }

  // Notify parent component of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters)
    }
  }, [filters, onFiltersChange])

  // Count active filters
  const activeFilterCount = 
    filters.zooTypes.length + 
    filters.animalTypes.length + 
    filters.amenities.length +
    (filters.distance !== 'all' ? 1 : 0) +
    (filters.priceRange !== 'all' ? 1 : 0) +
    (filters.rating !== 'all' ? 1 : 0)

  return (
    <div className={`filter-panel ${isOpen ? 'open' : 'closed'}`} data-testid="filter-panel">
      {/* Filter Toggle Button */}
      <button 
        className="filter-toggle"
        onClick={onToggle}
        data-testid="filter-toggle"
      >
        <span className="filter-icon">🔧</span>
        <span className="filter-text">Filters</span>
        {activeFilterCount > 0 && (
          <span className="filter-count">{activeFilterCount}</span>
        )}
      </button>

      {/* Filter Content */}
      <div className="filter-content">
        <div className="filter-header">
          <h3>Filter Results</h3>
          {activeFilterCount > 0 && (
            <button 
              className="clear-filters"
              onClick={clearAllFilters}
              data-testid="clear-all-filters"
            >
              Clear All
            </button>
          )}
        </div>   
     {/* Zoo Type Filters */}
        {filterOptions.zooTypes.length > 0 && (
          <div className="filter-section">
            <h4>Zoo Type</h4>
            <div className="filter-options">
              {filterOptions.zooTypes.map(zooType => (
                <label key={zooType} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.zooTypes.includes(zooType)}
                    onChange={(e) => handleFilterChange('zooTypes', zooType, e.target.checked)}
                    data-testid={`zoo-type-${zooType}`}
                  />
                  <span className="checkbox-label">{zooType}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Animal Type Filters */}
        {filterOptions.animalTypes.length > 0 && (
          <div className="filter-section">
            <h4>Animals</h4>
            <div className="filter-options">
              {filterOptions.animalTypes.slice(0, 8).map(animalType => (
                <label key={animalType} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.animalTypes.includes(animalType)}
                    onChange={(e) => handleFilterChange('animalTypes', animalType, e.target.checked)}
                    data-testid={`animal-type-${animalType}`}
                  />
                  <span className="checkbox-label">{animalType}</span>
                </label>
              ))}
              {filterOptions.animalTypes.length > 8 && (
                <div className="show-more">
                  <button type="button" className="show-more-btn">
                    +{filterOptions.animalTypes.length - 8} more
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Amenity Filters */}
        {filterOptions.amenities.length > 0 && (
          <div className="filter-section">
            <h4>Amenities</h4>
            <div className="filter-options">
              {filterOptions.amenities.slice(0, 6).map(amenity => (
                <label key={amenity} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => handleFilterChange('amenities', amenity, e.target.checked)}
                    data-testid={`amenity-${amenity}`}
                  />
                  <span className="checkbox-label">{amenity}</span>
                </label>
              ))}
              {filterOptions.amenities.length > 6 && (
                <div className="show-more">
                  <button type="button" className="show-more-btn">
                    +{filterOptions.amenities.length - 6} more
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Distance Filter */}
        {userLocation && (
          <div className="filter-section">
            <h4>Distance</h4>
            <div className="filter-options">
              <label className="filter-radio">
                <input
                  type="radio"
                  name="distance"
                  value="all"
                  checked={filters.distance === 'all'}
                  onChange={(e) => handleFilterChange('distance', e.target.value)}
                  data-testid="distance-all"
                />
                <span className="radio-label">Any distance</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="distance"
                  value="10"
                  checked={filters.distance === '10'}
                  onChange={(e) => handleFilterChange('distance', e.target.value)}
                  data-testid="distance-10"
                />
                <span className="radio-label">Within 10 miles</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="distance"
                  value="25"
                  checked={filters.distance === '25'}
                  onChange={(e) => handleFilterChange('distance', e.target.value)}
                  data-testid="distance-25"
                />
                <span className="radio-label">Within 25 miles</span>
              </label>
              <label className="filter-radio">
                <input
                  type="radio"
                  name="distance"
                  value="50"
                  checked={filters.distance === '50'}
                  onChange={(e) => handleFilterChange('distance', e.target.value)}
                  data-testid="distance-50"
                />
                <span className="radio-label">Within 50 miles</span>
              </label>
            </div>
          </div>
        )}        {/* 
Price Range Filter */}
        <div className="filter-section">
          <h4>Price Range</h4>
          <div className="filter-options">
            <label className="filter-radio">
              <input
                type="radio"
                name="priceRange"
                value="all"
                checked={filters.priceRange === 'all'}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                data-testid="price-all"
              />
              <span className="radio-label">Any price</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="priceRange"
                value="free"
                checked={filters.priceRange === 'free'}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                data-testid="price-free"
              />
              <span className="radio-label">Free</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="priceRange"
                value="low"
                checked={filters.priceRange === 'low'}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                data-testid="price-low"
              />
              <span className="radio-label">Under £10</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="priceRange"
                value="medium"
                checked={filters.priceRange === 'medium'}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                data-testid="price-medium"
              />
              <span className="radio-label">£10 - £25</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="priceRange"
                value="high"
                checked={filters.priceRange === 'high'}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                data-testid="price-high"
              />
              <span className="radio-label">Over £25</span>
            </label>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-section">
          <h4>Minimum Rating</h4>
          <div className="filter-options">
            <label className="filter-radio">
              <input
                type="radio"
                name="rating"
                value="all"
                checked={filters.rating === 'all'}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                data-testid="rating-all"
              />
              <span className="radio-label">Any rating</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="rating"
                value="4+"
                checked={filters.rating === '4+'}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                data-testid="rating-4plus"
              />
              <span className="radio-label">4+ stars</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="rating"
                value="3+"
                checked={filters.rating === '3+'}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                data-testid="rating-3plus"
              />
              <span className="radio-label">3+ stars</span>
            </label>
            <label className="filter-radio">
              <input
                type="radio"
                name="rating"
                value="2+"
                checked={filters.rating === '2+'}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
                data-testid="rating-2plus"
              />
              <span className="radio-label">2+ stars</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterPanel