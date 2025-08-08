import Link from "next/link"
import { urlFor } from "../sanity"
import { isMultiple } from "../utils"

const PropertyCard = ({ property }) => {
  const {
    _id,
    slug,
    mainImage,
    title,
    reviews,
    pricePerNight,
    propertyType,
    beds,
    bedrooms
  } = property

  const reviewCount = reviews?.length || 0

  return (
    <Link href={`/zoo/${slug.current}`}>
      <div className="card property-card" data-testid="property-card">
        <div className="card-image">
          {mainImage ? (
            <img 
              src={urlFor(mainImage).width(400).height(250).crop("fill").auto("format")} 
              alt={`${title} - property`}
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
            <h3 className="property-name">{title}</h3>
            {propertyType && (
              <span className="property-type">{propertyType}</span>
            )}
          </div>
          
          <div className="property-stats">
            {beds && bedrooms && (
              <p className="accommodation-info">
                {bedrooms} animal type{isMultiple(bedrooms)} • {beds} animal{isMultiple(beds)}
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
              {pricePerNight ? (
                <span className="price">
                  <strong>£{pricePerNight}</strong> admission
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

export default PropertyCard