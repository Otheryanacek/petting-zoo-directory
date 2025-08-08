import { sanityClient } from "../sanity"
import { getAllZoosQuery, getFilteredZoosQuery, getFilterOptionsQuery } from "./groqQueries"

/**
 * Fetch all petting zoos and properties
 */
export async function fetchAllZoos() {
  try {
    const result = await sanityClient.fetch(getAllZoosQuery)
    return [...result.pettingZoos, ...result.properties]
  } catch (error) {
    console.error('Error fetching zoos:', error)
    return []
  }
}

/**
 * Fetch filtered petting zoos and properties
 * @param {Object} filters - Filter parameters
 */
export async function fetchFilteredZoos(filters = {}) {
  try {
    const query = getFilteredZoosQuery(filters)
    const result = await sanityClient.fetch(query)
    return [...result.pettingZoos, ...result.properties]
  } catch (error) {
    console.error('Error fetching filtered zoos:', error)
    return []
  }
}

/**
 * Fetch filter options for dropdowns
 */
export async function fetchFilterOptions() {
  try {
    return await sanityClient.fetch(getFilterOptionsQuery)
  } catch (error) {
    console.error('Error fetching filter options:', error)
    return {
      zooTypes: [],
      animalTypes: [],
      amenities: []
    }
  }
}

/**
 * Client-side search function
 * @param {Array} properties - Array of properties to search
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered properties
 */
export function searchProperties(properties, searchTerm) {
  if (!searchTerm.trim()) return properties

  const searchLower = searchTerm.toLowerCase()
  
  return properties.filter(property => {
    const name = property.name || property.title || ""
    const description = property.description || ""
    const zooType = property.zooType || property.propertyType || ""
    const address = property.address || ""
    
    // Search in animals
    const animalMatch = property.animals?.some(animal => 
      animal.name?.toLowerCase().includes(searchLower) ||
      animal.species?.toLowerCase().includes(searchLower) ||
      animal.category?.toLowerCase().includes(searchLower)
    ) || false
    
    // Search in amenities
    const amenityMatch = property.amenities?.some(amenity =>
      amenity.name?.toLowerCase().includes(searchLower) ||
      amenity.description?.toLowerCase().includes(searchLower)
    ) || false
    
    return (
      name.toLowerCase().includes(searchLower) ||
      description.toLowerCase().includes(searchLower) ||
      zooType.toLowerCase().includes(searchLower) ||
      address.toLowerCase().includes(searchLower) ||
      animalMatch ||
      amenityMatch
    )
  })
}

/**
 * Debounced function utility
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get shareable URL for current filters and search
 * @param {string} searchTerm - Current search term
 * @param {Object} filters - Current filters
 * @returns {string} Shareable URL
 */
export function getShareableUrl(searchTerm, filters) {
  const url = new URL(window.location.origin + window.location.pathname)
  
  if (searchTerm.trim()) {
    url.searchParams.set('search', searchTerm)
  }
  
  // Add non-default filters
  const nonDefaultFilters = {}
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value) && value.length > 0) {
      nonDefaultFilters[key] = value
    } else if (!Array.isArray(value) && value !== 'all') {
      nonDefaultFilters[key] = value
    }
  })
  
  if (Object.keys(nonDefaultFilters).length > 0) {
    url.searchParams.set('filters', encodeURIComponent(JSON.stringify(nonDefaultFilters)))
  }
  
  return url.toString()
}

/**
 * Parse URL parameters to get search and filter state
 * @param {URLSearchParams} searchParams - URL search parameters
 * @returns {Object} Parsed search and filter state
 */
export function parseUrlParams(searchParams) {
  const search = searchParams.get('search') || ''
  
  let filters = {
    zooTypes: [],
    animalTypes: [],
    amenities: [],
    distance: 'all',
    priceRange: 'all',
    rating: 'all'
  }
  
  const filtersParam = searchParams.get('filters')
  if (filtersParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(filtersParam))
      filters = {
        zooTypes: parsed.zooTypes || [],
        animalTypes: parsed.animalTypes || [],
        amenities: parsed.amenities || [],
        distance: parsed.distance || 'all',
        priceRange: parsed.priceRange || 'all',
        rating: parsed.rating || 'all'
      }
    } catch (error) {
      console.warn('Failed to parse filters from URL:', error)
    }
  }
  
  return { search, filters }
}