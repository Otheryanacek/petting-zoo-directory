/**
 * Validation utilities for data migration
 */

/**
 * Validates a URL string
 */
export function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Validates a phone number (basic validation)
 */
export function isValidPhoneNumber(phone) {
  if (!phone || typeof phone !== 'string') return false
  // Basic phone number regex - matches various formats
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ''))
}

/**
 * Validates a geopoint object
 */
export function isValidGeopoint(location) {
  if (!location || typeof location !== 'object') return false
  
  const { lat, lng } = location
  
  if (typeof lat !== 'number' || typeof lng !== 'number') return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  
  return true
}

/**
 * Validates an image object
 */
export function isValidImage(image) {
  if (!image || typeof image !== 'object') return false
  
  // Check for required Sanity image structure
  if (!image.asset || !image.asset._ref) return false
  
  return true
}

/**
 * Validates a slug object
 */
export function isValidSlug(slug) {
  if (!slug || typeof slug !== 'object') return false
  if (!slug.current || typeof slug.current !== 'string') return false
  
  // Check slug format (lowercase, hyphens, no spaces)
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug.current)
}

/**
 * Sanitizes a string for use as a slug
 */
export function sanitizeSlug(text) {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validates operating hours object
 */
export function isValidOperatingHours(hours) {
  if (!hours || typeof hours !== 'object') return false
  
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const timeRegex = /^(\d{1,2}:\d{2}\s?(AM|PM))\s?-\s?(\d{1,2}:\d{2}\s?(AM|PM))$|^Closed$/i
  
  return days.every(day => {
    const dayHours = hours[day]
    return typeof dayHours === 'string' && timeRegex.test(dayHours)
  })
}

/**
 * Validates admission price object
 */
export function isValidAdmissionPrice(price) {
  if (!price || typeof price !== 'object') return false
  
  const { adult, child, senior } = price
  
  return (
    typeof adult === 'number' && adult >= 0 &&
    typeof child === 'number' && child >= 0 &&
    typeof senior === 'number' && senior >= 0
  )
}

/**
 * Comprehensive validation for a petting zoo document
 */
export function validatePettingZoo(zoo) {
  const errors = []
  const warnings = []
  
  // Required fields
  if (!zoo.name || typeof zoo.name !== 'string') {
    errors.push('Missing or invalid zoo name')
  }
  
  if (!isValidSlug(zoo.slug)) {
    errors.push('Missing or invalid slug')
  }
  
  // Optional but important fields
  if (!zoo.description || typeof zoo.description !== 'string') {
    warnings.push('Missing description')
  }
  
  if (!isValidGeopoint(zoo.location)) {
    warnings.push('Missing or invalid location')
  }
  
  if (!isValidImage(zoo.mainImage)) {
    warnings.push('Missing or invalid main image')
  }
  
  if (zoo.website && !isValidUrl(zoo.website)) {
    warnings.push('Invalid website URL')
  }
  
  if (zoo.phone && !isValidPhoneNumber(zoo.phone)) {
    warnings.push('Invalid phone number format')
  }
  
  if (zoo.operatingHours && !isValidOperatingHours(zoo.operatingHours)) {
    warnings.push('Invalid operating hours format')
  }
  
  if (zoo.admissionPrice && !isValidAdmissionPrice(zoo.admissionPrice)) {
    warnings.push('Invalid admission price structure')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}