import { urlFor } from "../sanity"

const Review = ({ review, showModeration = false }) => {
  const {
    rating,
    comment,
    visitDate,
    traveller,
    isApproved = true,
    moderationNotes,
    createdAt
  } = review

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return null
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return null
    }
  }

  // Generate star rating display
  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>)
    }
    
    return stars
  }

  return (
    <div className={`review-card ${!isApproved ? 'pending-approval' : ''}`} data-testid="review-card">
      <div className="review-header">
        <div className="reviewer-info">
          {traveller?.image && (
            <img
              src={urlFor(traveller.image)
                .width(50)
                .height(50)
                .crop("focalpoint")
                .auto("format")}
              alt={`${traveller.name} profile`}
              className="reviewer-avatar"
            />
          )}
          <div className="reviewer-details">
            <h4 className="reviewer-name">{traveller?.name || 'Anonymous'}</h4>
            {visitDate && (
              <p className="visit-date">Visited on {formatDate(visitDate)}</p>
            )}
          </div>
        </div>
        
        <div className="rating-section">
          <div className="stars">
            {renderStars(rating || 0)}
          </div>
          <span className="rating-number">({rating || 0}/5)</span>
        </div>
      </div>
      
      {comment && (
        <div className="review-content">
          <p className="review-comment">{comment}</p>
        </div>
      )}
      
      <div className="review-footer">
        <span className="review-date">
          {formatDate(createdAt) || 'Recently posted'}
        </span>
        
        {showModeration && (
          <div className="moderation-section">
            <span className={`approval-status ${isApproved ? 'approved' : 'pending'}`}>
              {isApproved ? '✓ Approved' : '⏳ Pending Review'}
            </span>
            {moderationNotes && (
              <p className="moderation-notes">
                <strong>Moderation Notes:</strong> {moderationNotes}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Review
