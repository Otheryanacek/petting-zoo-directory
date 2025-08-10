/**
 * Data validation utilities for the petting zoo website
 * Provides comprehensive validation and sanitization functions to prevent null reference errors
 */

/**
 * Validates and sanitizes petting zoo data structure
 * @param {object} zoo - Raw zoo data from Sanity
 * @returns {object} Validation result with sanitized data
 */
export function validateZooData(zoo) {
  const errors = [];
  const warnings = [];
  
  if (!zoo || typeof zoo !== 'object') {
    return {
      isValid: false,
      data: getDefaultZooData(),
      errors: ['Zoo data is null or not an object'],
      warnings: []
    };
  }

  // Create sanitized zoo object with safe defaults
  const sanitizedZoo = {
    _id: zoo._id || `temp-${Date.now()}`,
    name: zoo.name || 'Unnamed Petting Zoo',
    slug: validateSlugData(zoo.slug).data,
    description: zoo.description || 'No description available',
    location: validateLocationData(zoo.location).data,
    mainImage: validateImageData(zoo.mainImage).data,
    images: sanitizeArrayData(zoo.images).map(img => validateImageData(img).data).filter(Boolean),
    admissionPrice: validatePricingData(zoo.admissionPrice).data,
    reviews: sanitizeArrayData(zoo.reviews),
    amenities: sanitizeArrayData(zoo.amenities),
    animals: sanitizeArrayData(zoo.animals),
    contactInfo: zoo.contactInfo || {},
    hours: zoo.hours || {},
    website: zoo.website || null,
    phone: zoo.phone || null
  };

  // Check for critical missing data
  if (!zoo._id) {
    warnings.push('Zoo missing _id, using temporary ID');
  }
  if (!zoo.name) {
    warnings.push('Zoo missing name, using default');
  }
  if (!zoo.slug || !zoo.slug.current) {
    errors.push('Zoo missing valid slug');
  }

  return {
    isValid: errors.length === 0,
    data: sanitizedZoo,
    errors,
    warnings
  };
}

/**
 * Validates image data and ensures safe URL generation
 * @param {object} image - Image object from Sanity
 * @returns {object} Validation result with sanitized image data
 */
export function validateImageData(image) {
  if (!image || typeof image !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Image data is null or invalid'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  // Check for required image properties
  if (!image.asset) {
    errors.push('Image missing asset reference');
    return {
      isValid: false,
      data: null,
      errors,
      warnings
    };
  }

  const sanitizedImage = {
    asset: image.asset,
    alt: image.alt || 'Petting zoo image',
    caption: image.caption || null,
    hotspot: image.hotspot || null,
    crop: image.crop || null,
    _type: image._type || 'image'
  };

  if (!image.alt) {
    warnings.push('Image missing alt text, using default');
  }

  return {
    isValid: true,
    data: sanitizedImage,
    errors,
    warnings
  };
}

/**
 * Validates location data for mapping functionality
 * @param {object} location - Location object with lat/lng coordinates
 * @returns {object} Validation result with sanitized location data
 */
export function validateLocationData(location) {
  if (!location || typeof location !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Location data is null or invalid'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  const lat = parseFloat(location.lat);
  const lng = parseFloat(location.lng);

  // Validate latitude and longitude ranges
  if (isNaN(lat) || lat < -90 || lat > 90) {
    errors.push('Invalid latitude value');
  }
  if (isNaN(lng) || lng < -180 || lng > 180) {
    errors.push('Invalid longitude value');
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      data: null,
      errors,
      warnings
    };
  }

  const sanitizedLocation = {
    lat,
    lng,
    address: location.address || null,
    city: location.city || null,
    state: location.state || null,
    zipCode: location.zipCode || null
  };

  return {
    isValid: true,
    data: sanitizedLocation,
    errors,
    warnings
  };
}

/**
 * Validates slug data for safe navigation
 * @param {object} slug - Slug object from Sanity
 * @returns {object} Validation result with sanitized slug data
 */
export function validateSlugData(slug) {
  if (!slug || typeof slug !== 'object') {
    return {
      isValid: false,
      data: { current: null },
      errors: ['Slug data is null or invalid'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  if (!slug.current || typeof slug.current !== 'string') {
    errors.push('Slug missing current value');
    return {
      isValid: false,
      data: { current: null },
      errors,
      warnings
    };
  }

  // Validate slug format (should be URL-safe)
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugPattern.test(slug.current)) {
    warnings.push('Slug format may not be URL-safe');
  }

  const sanitizedSlug = {
    current: slug.current.toLowerCase().trim(),
    _type: slug._type || 'slug'
  };

  return {
    isValid: true,
    data: sanitizedSlug,
    errors,
    warnings
  };
}

/**
 * Safely converts any value to an array
 * @param {any} data - Data that should be an array
 * @returns {array} Safe array (empty if input is invalid)
 */
export function sanitizeArrayData(data) {
  if (Array.isArray(data)) {
    return data.filter(item => item != null); // Remove null/undefined items
  }
  return [];
}

/**
 * Validates pricing data structure
 * @param {object} pricing - Admission pricing data
 * @returns {object} Validation result with sanitized pricing data
 */
export function validatePricingData(pricing) {
  if (!pricing || typeof pricing !== 'object') {
    return {
      isValid: false,
      data: null,
      errors: ['Pricing data is null or invalid'],
      warnings: []
    };
  }

  const errors = [];
  const warnings = [];

  const sanitizedPricing = {
    adult: validatePrice(pricing.adult),
    child: validatePrice(pricing.child),
    senior: validatePrice(pricing.senior),
    group: validatePrice(pricing.group),
    currency: pricing.currency || 'USD'
  };

  // Remove null prices
  Object.keys(sanitizedPricing).forEach(key => {
    if (sanitizedPricing[key] === null && key !== 'currency') {
      delete sanitizedPricing[key];
    }
  });

  if (Object.keys(sanitizedPricing).length === 1) { // Only currency left
    warnings.push('No valid pricing information available');
  }

  return {
    isValid: true,
    data: Object.keys(sanitizedPricing).length > 1 ? sanitizedPricing : null,
    errors,
    warnings
  };
}

/**
 * Validates individual price value
 * @param {any} price - Price value to validate
 * @returns {number|null} Valid price or null
 */
function validatePrice(price) {
  const numPrice = parseFloat(price);
  return (!isNaN(numPrice) && numPrice >= 0) ? numPrice : null;
}

/**
 * Returns default zoo data structure for fallback scenarios
 * @returns {object} Default zoo data
 */
function getDefaultZooData() {
  return {
    _id: `fallback-${Date.now()}`,
    name: 'Unnamed Petting Zoo',
    slug: { current: null },
    description: 'Information not available',
    location: null,
    mainImage: null,
    images: [],
    admissionPrice: null,
    reviews: [],
    amenities: [],
    animals: [],
    contactInfo: {},
    hours: {},
    website: null,
    phone: null
  };
}

/**
 * Validates complete data structure from API response
 * @param {any} data - Raw data from API
 * @returns {object} Comprehensive validation result
 */
export function validateAndSanitizeData(data) {
  const errors = [];
  const warnings = [];
  let sanitizedData = {};

  if (!data) {
    return {
      isValid: false,
      data: { pettingZoos: [] },
      errors: ['No data received from API'],
      warnings: []
    };
  }

  // Handle different data structures
  if (Array.isArray(data)) {
    // Direct array of zoos
    const validatedZoos = data.map(zoo => validateZooData(zoo));
    sanitizedData.pettingZoos = validatedZoos
      .filter(result => result.isValid)
      .map(result => result.data);
    
    validatedZoos.forEach(result => {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });
  } else if (data.pettingZoos && Array.isArray(data.pettingZoos)) {
    // Object with pettingZoos array
    const validatedZoos = data.pettingZoos.map(zoo => validateZooData(zoo));
    sanitizedData = {
      ...data,
      pettingZoos: validatedZoos
        .filter(result => result.isValid)
        .map(result => result.data)
    };
    
    validatedZoos.forEach(result => {
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    });
  } else {
    // Single zoo object
    const validatedZoo = validateZooData(data);
    sanitizedData = validatedZoo.data;
    errors.push(...validatedZoo.errors);
    warnings.push(...validatedZoo.warnings);
  }

  return {
    isValid: errors.length === 0,
    data: sanitizedData,
    errors,
    warnings
  };
}