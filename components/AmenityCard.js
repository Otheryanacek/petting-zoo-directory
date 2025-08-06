const AmenityCard = ({ amenity }) => {
  const {
    name,
    description,
    icon,
    category,
    isAvailable = true
  } = amenity

  // Default icons for common amenities if no icon is provided
  const getDefaultIcon = (amenityName) => {
    const iconMap = {
      'parking': '🅿️',
      'restrooms': '🚻',
      'gift shop': '🛍️',
      'picnic area': '🧺',
      'playground': '🛝',
      'food court': '🍔',
      'wheelchair accessible': '♿',
      'stroller friendly': '👶',
      'hand washing station': '🧼',
      'first aid': '🏥',
      'guided tours': '👥',
      'educational programs': '📚',
      'birthday parties': '🎂',
      'group discounts': '👨‍👩‍👧‍👦',
      'online booking': '💻',
      'photography allowed': '📸'
    }
    
    const lowerName = amenityName.toLowerCase()
    return iconMap[lowerName] || '✨'
  }

  const displayIcon = icon || getDefaultIcon(name)

  return (
    <div className={`amenity-card ${!isAvailable ? 'unavailable' : ''}`} data-testid="amenity-card">
      <div className="amenity-icon">
        {typeof displayIcon === 'string' ? (
          <span className="icon-emoji">{displayIcon}</span>
        ) : (
          <img src={displayIcon} alt={`${name} icon`} className="icon-image" />
        )}
      </div>
      
      <div className="amenity-content">
        <h4 className="amenity-name">{name}</h4>
        
        {category && (
          <span className="amenity-category">{category}</span>
        )}
        
        {description && (
          <p className="amenity-description">{description}</p>
        )}
        
        {!isAvailable && (
          <span className="unavailable-badge">Currently Unavailable</span>
        )}
      </div>
    </div>
  )
}

export default AmenityCard