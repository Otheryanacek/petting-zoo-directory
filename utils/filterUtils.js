/**
 * Utility functions for filtering petting zoo data
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in miles
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Get the price for a property/zoo
 * @param {Object} property - Property or zoo object
 * @returns {number} Price value
 */
export function getPrice(property) {
  if (property.admissionPrice?.adult) {
    return property.admissionPrice.adult
  }
  if (property.pricePerNight) {
    return property.pricePerNight
  }
  return 0
}

/**
 * Calculate average rating for a property
 * @param {Array} reviews - Array of review objects
 * @returns {number} Average rating
 */
export function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) return 0
  
  const validReviews = reviews.filter(review => 
    review.rating && typeof review.rating === 'number' && review.isApproved !== false
  )
  
  if (validReviews.length === 0) return 0
  
  const sum = validReviews.reduce((total, review) => total + review.rating, 0)
  return sum / validReviews.length
}

/**
 * Apply filters to a list of properties
 * @param {Array} properties - Array of property/zoo objects
 * @param {Object} filters - Filter criteria
 * @param {Object} userLocation - User's location {lat, lng}
 * @returns {Array} Filtered properties
 */
export function applyFilters(properties, filters, userLocation = null) {
  return properties.filter(property => {
    // Zoo type filter
    if (filters.zooTypes && filters.zooTypes.length > 0) {
      const zooType = property.zooType || property.propertyType
      if (!zooType || !filters.zooTypes.includes(zooType)) {
        return false
      }
    }

    // Animal type filter
    if (filters.animalTypes && filters.animalTypes.length > 0) {
      const hasMatchingAnimal = property.animals?.some(animal => 
        filters.animalTypes.includes(animal.species) || 
        filters.animalTypes.includes(animal.category)
      )
      if (!hasMatchingAnimal) {
        return false
      }
    }

    // Amenity filter
    if (filters.amenities && filters.amenities.length > 0) {
      const hasMatchingAmenity = property.amenities?.some(amenity =>
        filters.amenities.includes(amenity.name)
      )
      if (!hasMatchingAmenity) {
        return false
      }
    }

    // Distance filter
    if (filters.distance && filters.distance !== 'all' && userLocation && property.location) {
      const maxDistance = parseInt(filters.distance)
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        property.location.lat,
        property.location.lng
      )
      if (distance > maxDistance) {
        return false
      }
    }

    // Price range filter
    if (filters.priceRange && filters.priceRange !== 'all') {
      const price = getPrice(property)
      
      switch (filters.priceRange) {
        case 'free':
          if (price > 0) return false
          break
        case 'low':
          if (price >= 10) return false
          break
        case 'medium':
          if (price < 10 || price > 25) return false
          break
        case 'high':
          if (price <= 25) return false
          break
      }
    }

    // Rating filter
    if (filters.rating && filters.rating !== 'all') {
      const avgRating = calculateAverageRating(property.reviews)
      const minRating = parseInt(filters.rating.replace('+', ''))
      
      if (avgRating < minRating) {
        return false
      }
    }

    return true
  })
}

/**
 * Get filter summary text
 * @param {Object} filters - Filter criteria
 * @param {number} totalCount - Total number of items
 * @param {number} filteredCount - Number of filtered items
 * @returns {string} Summary text
 */
export function getFilterSummary(filters, totalCount, filteredCount) {
  const activeFilters = []
  
  if (filters.zooTypes?.length > 0) {
    activeFilters.push(`${filters.zooTypes.length} zoo type${filters.zooTypes.length > 1 ? 's' : ''}`)
  }
  
  if (filters.animalTypes?.length > 0) {
    activeFilters.push(`${filters.animalTypes.length} animal type${filters.animalTypes.length > 1 ? 's' : ''}`)
  }
  
  if (filters.amenities?.length > 0) {
    activeFilters.push(`${filters.amenities.length} amenit${filters.amenities.length > 1 ? 'ies' : 'y'}`)
  }
  
  if (filters.distance !== 'all') {
    activeFilters.push(`within ${filters.distance} miles`)
  }
  
  if (filters.priceRange !== 'all') {
    const priceLabels = {
      free: 'free',
      low: 'under £10',
      medium: '£10-£25',
      high: 'over £25'
    }
    activeFilters.push(priceLabels[filters.priceRange])
  }
  
  if (filters.rating !== 'all') {
    activeFilters.push(`${filters.rating} stars`)
  }
  
  if (activeFilters.length === 0) {
    return `Showing all ${totalCount} petting zoos`
  }
  
  return `Showing ${filteredCount} of ${totalCount} petting zoos (${activeFilters.join(', ')})`
}