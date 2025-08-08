import { useState, useRef, useEffect } from "react"

const SearchBar = ({ 
  onSearch, 
  onLocationSelect, 
  placeholder = "Search petting zoos...",
  showLocationSearch = true,
  initialValue = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)
  const [locationQuery, setLocationQuery] = useState("")
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false)
  const searchInputRef = useRef(null)
  const locationInputRef = useRef(null)
  const autocompleteService = useRef(null)
  const placesService = useRef(null)

  // Initialize Google Places services
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && showLocationSearch) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      placesService.current = new window.google.maps.places.PlacesService(
        document.createElement('div')
      )
    }
  }, [showLocationSearch])

  // Handle keyword search
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Debounced search - trigger search after user stops typing
    if (onSearch) {
      clearTimeout(handleSearchChange.timeoutId)
      handleSearchChange.timeoutId = setTimeout(() => {
        onSearch(value)
      }, 300)
    }
  }

  // Handle location search with Google Places API
  const handleLocationChange = (e) => {
    const value = e.target.value
    setLocationQuery(value)
    
    if (!value.trim() || !autocompleteService.current) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingPlaces(true)
    
    // Get place predictions
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        types: ['(cities)'], // Focus on cities and regions
        componentRestrictions: { country: 'us' } // Adjust as needed
      },
      (predictions, status) => {
        setIsLoadingPlaces(false)
        
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.slice(0, 5)) // Limit to 5 suggestions
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      }
    )
  }  // Handle
 location selection
  const handleLocationSelect = (place) => {
    setLocationQuery(place.description)
    setShowSuggestions(false)
    
    if (placesService.current && onLocationSelect) {
      // Get detailed place information
      placesService.current.getDetails(
        { placeId: place.place_id },
        (placeDetails, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            const location = {
              name: place.description,
              lat: placeDetails.geometry.location.lat(),
              lng: placeDetails.geometry.location.lng(),
              placeId: place.place_id
            }
            onLocationSelect(location)
          }
        }
      )
    }
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm.trim())
    }
  }

  // Clear search
  const clearSearch = () => {
    setSearchTerm("")
    setLocationQuery("")
    setSuggestions([])
    setShowSuggestions(false)
    if (onSearch) onSearch("")
    if (onLocationSelect) onLocationSelect(null)
  }

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="search-bar" data-testid="search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-inputs">
          {/* Keyword Search */}
          <div className="search-input-group">
            <div className="input-wrapper">
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className="search-input keyword-search"
                data-testid="keyword-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="clear-button"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div> 
         {/* Location Search */}
          {showLocationSearch && (
            <div className="search-input-group location-search-group" ref={locationInputRef}>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={locationQuery}
                  onChange={handleLocationChange}
                  placeholder="Near location..."
                  className="search-input location-search"
                  data-testid="location-search-input"
                />
                <span className="location-icon">📍</span>
              </div>
              
              {/* Location Suggestions */}
              {showSuggestions && (
                <div className="suggestions-dropdown" data-testid="location-suggestions">
                  {isLoadingPlaces && (
                    <div className="suggestion-item loading">
                      <span>Loading locations...</span>
                    </div>
                  )}
                  {!isLoadingPlaces && suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      className="suggestion-item"
                      onClick={() => handleLocationSelect(suggestion)}
                      data-testid="location-suggestion"
                    >
                      <span className="suggestion-icon">📍</span>
                      <span className="suggestion-text">{suggestion.description}</span>
                    </button>
                  ))}
                  {!isLoadingPlaces && suggestions.length === 0 && (
                    <div className="suggestion-item no-results">
                      No locations found
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          type="submit"
          className="search-button"
          disabled={!searchTerm.trim()}
          data-testid="search-submit-button"
        >
          <span className="search-icon">🔍</span>
          <span className="search-text">Search</span>
        </button>
      </form>
    </div>
  )
}

export default SearchBar