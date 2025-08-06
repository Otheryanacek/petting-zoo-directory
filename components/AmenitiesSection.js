import { useState } from "react"
import AmenityCard from "./AmenityCard"

const AmenitiesSection = ({ amenities = [], title = "Amenities & Facilities" }) => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showUnavailable, setShowUnavailable] = useState(true)

  // Get unique categories for filtering
  const categories = ["all", ...new Set(amenities.map(amenity => amenity.category).filter(Boolean))]
  
  // Filter amenities based on selected filters
  const filteredAmenities = amenities.filter(amenity => {
    const categoryMatch = selectedCategory === "all" || amenity.category === selectedCategory
    const availabilityMatch = showUnavailable || amenity.isAvailable !== false
    
    return categoryMatch && availabilityMatch
  })

  // Group amenities by category for better organization
  const groupedAmenities = filteredAmenities.reduce((groups, amenity) => {
    const category = amenity.category || 'General'
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(amenity)
    return groups
  }, {})

  if (!amenities || amenities.length === 0) {
    return (
      <div className="amenities-section" data-testid="amenities-section">
        <h2 className="section-title">{title}</h2>
        <div className="no-amenities">
          <p>No amenities information available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="amenities-section" data-testid="amenities-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="amenity-count">
          {filteredAmenities.length} of {amenities.length} amenities
        </div>
      </div>
      
      <div className="amenity-filters">
        <div className="filter-group">
          <label className="filter-label">Category:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label className="filter-checkbox">
            <input 
              type="checkbox" 
              checked={showUnavailable}
              onChange={(e) => setShowUnavailable(e.target.checked)}
            />
            Show unavailable amenities
          </label>
        </div>
      </div>
      
      {selectedCategory === "all" ? (
        // Show grouped by category
        <div className="amenities-grouped">
          {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
            <div key={category} className="amenity-category-group">
              <h3 className="category-title">{category}</h3>
              <div className="amenities-grid">
                {categoryAmenities.map((amenity) => (
                  <AmenityCard key={amenity._id || amenity._key} amenity={amenity} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Show flat grid for specific category
        <div className="amenities-grid">
          {filteredAmenities.map((amenity) => (
            <AmenityCard key={amenity._id || amenity._key} amenity={amenity} />
          ))}
        </div>
      )}
      
      {filteredAmenities.length === 0 && (
        <div className="no-results">
          <p>No amenities match the selected filters.</p>
          <button 
            onClick={() => {
              setSelectedCategory("all")
              setShowUnavailable(true)
            }}
            className="reset-filters-btn"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}

export default AmenitiesSection