import { useState } from "react"

const SimpleSearchBar = ({ 
  onSearch, 
  placeholder = "Search petting zoos...",
  initialValue = ""
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Immediate search as user types (debounced)
    if (onSearch) {
      clearTimeout(handleSearchChange.timeoutId)
      handleSearchChange.timeoutId = setTimeout(() => {
        onSearch(value.trim())
      }, 300)
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
    if (onSearch) onSearch("")
  }

  return (
    <div className="simple-search-bar" data-testid="simple-search-bar">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="search-input"
            data-testid="search-input"
          />
          
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="clear-button"
              aria-label="Clear search"
              data-testid="clear-search-button"
            >
              ✕
            </button>
          )}
          
          <button
            type="submit"
            className="search-button"
            disabled={!searchTerm.trim()}
            data-testid="search-submit-button"
          >
            🔍
          </button>
        </div>
      </form>
    </div>
  )
}

export default SimpleSearchBar