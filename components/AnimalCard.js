import { urlFor } from "../sanity"

const AnimalCard = ({ animal }) => {
  const {
    name,
    species,
    category,
    image,
    description,
    canPet,
    canFeed,
    ageGroup,
    temperament
  } = animal

  return (
    <div className="animal-card" data-testid="animal-card">
      <div className="animal-image">
        {image ? (
          <img 
            src={urlFor(image).width(200).height(150).crop("fill").auto("format")} 
            alt={`${name} - ${species}`}
            loading="lazy"
          />
        ) : (
          <div className="animal-placeholder">
            <span>🐾</span>
          </div>
        )}
      </div>
      
      <div className="animal-info">
        <div className="animal-header">
          <h4 className="animal-name">{name}</h4>
          <span className="animal-species">{species}</span>
        </div>
        
        {category && (
          <div className="animal-category">
            <span className="category-badge">{category}</span>
          </div>
        )}
        
        <div className="animal-interactions">
          {canPet && (
            <span className="interaction-badge petting">
              <span className="interaction-icon">✋</span>
              Can Pet
            </span>
          )}
          {canFeed && (
            <span className="interaction-badge feeding">
              <span className="interaction-icon">🥕</span>
              Can Feed
            </span>
          )}
        </div>
        
        {temperament && (
          <div className="animal-temperament">
            <span className="temperament-label">Temperament:</span>
            <span className="temperament-value">{temperament}</span>
          </div>
        )}
        
        {ageGroup && (
          <div className="animal-age">
            <span className="age-label">Age:</span>
            <span className="age-value">{ageGroup}</span>
          </div>
        )}
        
        {description && (
          <p className="animal-description">{description}</p>
        )}
      </div>
    </div>
  )
}

export default AnimalCard