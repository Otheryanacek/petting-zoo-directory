import Link from "next/link"
import { urlFor } from "../sanity"
import { isMultiple } from "../utils"

const PettingZooCard = ({ zoo }) => {
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
    <Link href={`/${linkPath}/${slug.current}`}>
      <div className="card petting-zoo-card" data-testid="petting-zoo-card">
        <div className="card-image">
          {mainImage ? (
            <img 
              src={urlFor(mainImage).width(400).height(250).crop("fill").auto("format")} 
              alt={`${displayName} - petting zoo`}
              loading="lazy"
            />
          ) : (
            <div className="placeholder-image">
              <span>No Image Available</span>
            </div>
          )}
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
    </Link>
  )
}

export default PettingZooCard