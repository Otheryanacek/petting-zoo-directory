import { useState, useEffect, useCallback } from 'react'
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
  
  const [value, setValue] = useState(defaultValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize from URL when router is ready
  useEffect(() => {
    if (!router.isReady || isInitialized) return
    
    const urlValue = router.query[key]
    if (urlValue) {
      try {
        const parsedValue = deserialize(Array.isArray(urlValue) ? urlValue[0] : urlValue)
        setValue(parsedValue)
      } catch {
        setValue(defaultValue)
      }
    }
    setIsInitialized(true)
  }, [router.isReady, router.query, key, defaultValue, deserialize, isInitialized])

  // Custom setValue that updates URL
  const setValueAndUrl = useCallback((newValue) => {
    setValue(newValue)
    
    if (!router.isReady) return
    
    const currentQuery = { ...router.query }
    
    if (newValue === defaultValue || newValue === '' || (Array.isArray(newValue) && newValue.length === 0)) {
      delete currentQuery[key]
    } else {
      currentQuery[key] = serialize(newValue)
    }

    const method = replace ? 'replace' : 'push'
    router[method]({
      pathname: router.pathname,
      query: currentQuery
    }, undefined, { shallow: true })
  }, [router, key, defaultValue, serialize, replace])

  return [value, setValueAndUrl]
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
      try {
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
      } catch {
        return ''
      }
    },
    deserialize: (value) => {
      if (!value || value === '') return defaultValue
      
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