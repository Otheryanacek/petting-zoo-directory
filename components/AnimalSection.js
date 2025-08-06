import { useState } from "react"
import AnimalCard from "./AnimalCard"

const AnimalSection = ({ animals = [], title = "Animals" }) => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedInteraction, setSelectedInteraction] = useState("all")

  // Get unique categories for filtering
  const categories = ["all", ...new Set(animals.map(animal => animal.category).filter(Boolean))]
  
  // Filter animals based on selected filters
  const filteredAnimals = animals.filter(animal => {
    const categoryMatch = selectedCategory === "all" || animal.category === selectedCategory
    const interactionMatch = selectedInteraction === "all" || 
      (selectedInteraction === "petting" && animal.canPet) ||
      (selectedInteraction === "feeding" && animal.canFeed)
    
    return categoryMatch && interactionMatch
  })

  if (!animals || animals.length === 0) {
    return (
      <div className="animal-section" data-testid="animal-section">
        <h2 className="section-title">{title}</h2>
        <div className="no-animals">
          <p>No animals information available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animal-section" data-testid="animal-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="animal-count">
          {filteredAnimals.length} of {animals.length} animals
        </div>
      </div>
      
      <div className="animal-filters">
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
          <label className="filter-label">Interaction:</label>
          <select 
            value={selectedInteraction} 
            onChange={(e) => setSelectedInteraction(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Animals</option>
            <option value="petting">Can Pet</option>
            <option value="feeding">Can Feed</option>
          </select>
        </div>
      </div>
      
      <div className="animals-grid">
        {filteredAnimals.map((animal) => (
          <AnimalCard key={animal._id || animal._key} animal={animal} />
        ))}
      </div>
      
      {filteredAnimals.length === 0 && (
        <div className="no-results">
          <p>No animals match the selected filters.</p>
          <button 
            onClick={() => {
              setSelectedCategory("all")
              setSelectedInteraction("all")
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

export default AnimalSection