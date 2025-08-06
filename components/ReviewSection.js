import { useState } from "react"
import Review from "./Review"

const ReviewSection = ({ 
  reviews = [], 
  title = "Visitor Reviews", 
  showModeration = false,
  allowSorting = true 
}) => {
  const [sortBy, setSortBy] = useState("newest")
  const [filterRating, setFilterRating] = useState("all")

  // Filter reviews based on approval status for public view
  const visibleReviews = showModeration 
    ? reviews 
    : reviews.filter(review => review.isApproved !== false)

  // Apply rating filter
  const ratingFilteredReviews = filterRating === "all" 
    ? visibleReviews
    : visibleReviews.filter(review => {
        const rating = review.rating || 0
        switch (filterRating) {
          case "5": return rating === 5
          case "4": return rating >= 4 && rating < 5
          case "3": return rating >= 3 && rating < 4
          case "2": return rating >= 2 && rating < 3
          case "1": return rating >= 1 && rating < 2
          default: return true
        }
      })

  // Sort reviews
  const sortedReviews = [...ratingFilteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      case "oldest":
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      case "highest":
        return (b.rating || 0) - (a.rating || 0)
      case "lowest":
        return (a.rating || 0) - (b.rating || 0)
      case "visit-date":
        return new Date(b.visitDate || 0) - new Date(a.visitDate || 0)
      default:
        return 0
    }
  })

  // Calculate average rating
  const averageRating = visibleReviews.length > 0 
    ? (visibleReviews.reduce((sum, review) => sum + (review.rating || 0), 0) / visibleReviews.length).toFixed(1)
    : 0

  // Rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: visibleReviews.filter(review => Math.floor(review.rating || 0) === rating).length
  }))

  if (visibleReviews.length === 0) {
    return (
      <div className="review-section" data-testid="review-section">
        <h2 className="section-title">{title}</h2>
        <div className="no-reviews">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="review-section" data-testid="review-section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <div className="review-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <span className="rating-label">out of 5</span>
          </div>
          <div className="review-count">
            {sortedReviews.length} review{sortedReviews.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="rating-breakdown">
        {ratingDistribution.map(({ rating, count }) => (
          <div key={rating} className="rating-bar">
            <span className="rating-label">{rating} ★</span>
            <div className="bar-container">
              <div 
                className="bar-fill" 
                style={{ 
                  width: visibleReviews.length > 0 
                    ? `${(count / visibleReviews.length) * 100}%` 
                    : '0%' 
                }}
              ></div>
            </div>
            <span className="rating-count">({count})</span>
          </div>
        ))}
      </div>

      {allowSorting && (
        <div className="review-controls">
          <div className="control-group">
            <label className="control-label">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="control-select"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
              <option value="visit-date">Recent Visits</option>
            </select>
          </div>
          
          <div className="control-group">
            <label className="control-label">Filter by rating:</label>
            <select 
              value={filterRating} 
              onChange={(e) => setFilterRating(e.target.value)}
              className="control-select"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>
        </div>
      )}

      <div className="reviews-list">
        {sortedReviews.map((review) => (
          <Review 
            key={review._key || review._id} 
            review={review} 
            showModeration={showModeration}
          />
        ))}
      </div>

      {sortedReviews.length === 0 && ratingFilteredReviews.length !== visibleReviews.length && (
        <div className="no-results">
          <p>No reviews match the selected filters.</p>
          <button 
            onClick={() => {
              setSortBy("newest")
              setFilterRating("all")
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

export default ReviewSection