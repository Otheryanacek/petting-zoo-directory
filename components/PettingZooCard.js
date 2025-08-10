import SafeLink from "./SafeLink"
import SafeImage from "./SafeImage"
import { isMultiple } from "../utils"

const PettingZooCard = ({ zoo }) => {
  // Add safety check for zoo data
  if (!zoo) {
    console.error('PettingZooCard received null/undefined zoo data')
    return null
  }

  const {
    _id,
    slug,
    mainImage,
    title,
    name,
    reviews,
    pricePerNight,
    admissionPrice,
    itemType,
    zooType,
    animalCount,
    animalTypes
  } = zoo

  // Handle both property and pettingZoo data structures
  const displayName = name || title
  const displayPrice = admissionPrice?.adult || pricePerNight
  const reviewCount = reviews?.length || 0
  const linkPath = itemType === 'pettingZoo' ? 'zoo' : 'property'

  return (
    <SafeLink 
      slug={slug}
      basePath={`/${linkPath}`}
      className="card-link"
      fallbackComponent={() => (
        <div className="card petting-zoo-card error-card" data-testid="petting-zoo-card">
          <div className="card-content">
            <h3>Zoo Information Unavailable</h3>
            <p>This zoo entry has missing link information.</p>
          </div>
        </div>
      )}
    >
      <div className="card petting-zoo-card" data-testid="petting-zoo-card">
        <div className="card-image">
          <SafeImage 
            image={mainImage}
            width={400}
            height={250}
            alt={`${displayName} - petting zoo`}
            fallbackText="Zoo image not available"
            fallbackIcon="🏞️"
            style={{ borderRadius: '8px 8px 0 0' }}
          />
        </div>
        
        <div className="card-content">
          <div className="card-header">
            <h3 className="zoo-name">{displayName}</h3>
            {zooType && (
              <span className="zoo-type">{zooType}</span>
            )}
          </div>
          
          <div className="zoo-stats">
            {animalCount && animalTypes && (
              <p className="animal-info">
                {animalTypes} animal type{isMultiple(animalTypes)} • {animalCount} animal{isMultiple(animalCount)}
              </p>
            )}
          </div>
          
          <div className="card-footer">
            <div className="reviews">
              <span className="review-count">
                {reviewCount} review{isMultiple(reviewCount)}
              </span>
            </div>
            
            <div className="pricing">
              {displayPrice ? (
                <span className="price">
                  <strong>£{displayPrice}</strong> admission
                </span>
              ) : (
                <span className="price">Contact for pricing</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </SafeLink>
  )
}

export default PettingZooCard