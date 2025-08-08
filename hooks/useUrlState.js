import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

/**
 * Custom hook for managing state in URL query parameters
 * @param {string} key - The query parameter key
 * @param {*} defaultValue - Default value when parameter is not present
 * @param {Object} options - Configuration options
 * @returns {[value, setValue]} - Current value and setter function
 */
export function useUrlState(key, defaultValue, options = {}) {
  const router = useRouter()
  const { serialize = JSON.stringify, deserialize = JSON.parse, replace = false } = options
  
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue
    
    const urlValue = router.query[key]
    if (!urlValue) return defaultValue
    
    try {
      return deserialize(Array.isArray(urlValue) ? urlValue[0] : urlValue)
    } catch {
      return defaultValue
    }
  })

  // Update URL when value changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    const currentQuery = { ...router.query }
    
    if (value === defaultValue || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete currentQuery[key]
    } else {
      currentQuery[key] = serialize(value)
    }

    const method = replace ? 'replace' : 'push'
    router[method]({
      pathname: router.pathname,
      query: currentQuery
    }, undefined, { shallow: true })
  }, [value, key, defaultValue, serialize, replace, router])

  // Update state when URL changes
  useEffect(() => {
    const urlValue = router.query[key]
    
    if (!urlValue) {
      setValue(defaultValue)
      return
    }

    try {
      const parsedValue = deserialize(Array.isArray(urlValue) ? urlValue[0] : urlValue)
      setValue(parsedValue)
    } catch {
      setValue(defaultValue)
    }
  }, [router.query[key], key, defaultValue, deserialize])

  return [value, setValue]
}

/**
 * Hook for managing search term in URL
 */
export function useSearchState(defaultValue = '') {
  return useUrlState('search', defaultValue, {
    serialize: (value) => value,
    deserialize: (value) => value,
    replace: true
  })
}

/**
 * Hook for managing filters in URL
 */
export function useFiltersState(defaultValue = {}) {
  return useUrlState('filters', defaultValue, {
    serialize: (filters) => {
      // Only serialize non-default values
      const nonDefaultFilters = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          nonDefaultFilters[key] = value
        } else if (!Array.isArray(value) && value !== 'all') {
          nonDefaultFilters[key] = value
        }
      })
      
      return Object.keys(nonDefaultFilters).length > 0 
        ? encodeURIComponent(JSON.stringify(nonDefaultFilters))
        : ''
    },
    deserialize: (value) => {
      if (!value) return defaultValue
      
      try {
        const parsed = JSON.parse(decodeURIComponent(value))
        return {
          zooTypes: parsed.zooTypes || [],
          animalTypes: parsed.animalTypes || [],
          amenities: parsed.amenities || [],
          distance: parsed.distance || 'all',
          priceRange: parsed.priceRange || 'all',
          rating: parsed.rating || 'all'
        }
      } catch {
        return defaultValue
      }
    },
    replace: true
  })
}