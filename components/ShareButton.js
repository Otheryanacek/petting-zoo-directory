import { useState } from "react"
import { getShareableUrl } from "../utils/dataFetching"

const ShareButton = ({ searchTerm, filters, className = "" }) => {
  const [copied, setCopied] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  const handleShare = async () => {
    const shareUrl = getShareableUrl(searchTerm, filters)
    
    // Try to use Web Share API first (mobile devices)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Petting Zoo Directory - Search Results',
          text: 'Check out these petting zoos!',
          url: shareUrl
        })
        return
      } catch (error) {
        // Fall back to clipboard if share is cancelled or fails
      }
    }
    
    // Fall back to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setShowTooltip(true)
      
      setTimeout(() => {
        setCopied(false)
        setShowTooltip(false)
      }, 2000)
    } catch (error) {
      // Final fallback - show URL in prompt
      prompt('Copy this URL to share:', shareUrl)
    }
  }

  // Don't show share button if no search or filters are active
  const hasActiveFilters = searchTerm.trim() || 
    filters.zooTypes?.length > 0 ||
    filters.animalTypes?.length > 0 ||
    filters.amenities?.length > 0 ||
    filters.distance !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.rating !== 'all'

  if (!hasActiveFilters) return null

  return (
    <div className={`share-button-container ${className}`} data-testid="share-button-container">
      <button
        onClick={handleShare}
        className="share-button"
        data-testid="share-button"
        title="Share these search results"
      >
        <span className="share-icon">🔗</span>
        <span className="share-text">Share</span>
      </button>
      
      {showTooltip && (
        <div className="share-tooltip" data-testid="share-tooltip">
          {copied ? 'Link copied!' : 'Sharing...'}
        </div>
      )}
    </div>
  )
}

export default ShareButton