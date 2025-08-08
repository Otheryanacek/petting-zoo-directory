/**
 * GROQ queries for petting zoo data with filtering support
 */

/**
 * Base query for petting zoo data
 */
const baseZooFields = `
  _id,
  _rev,
  name,
  slug,
  description,
  location,
  address,
  phone,
  website,
  zooType,
  mainImage,
  images,
  admissionPrice,
  animalCount,
  animalTypes,
  operatingHours,
  owner->{
    _id,
    name,
    slug,
    image
  },
  animals[]->{
    _id,
    name,
    species,
    category,
    image,
    description,
    canPet,
    canFeed,
    ageGroup,
    temperament
  },
  amenities[]->{
    _id,
    name,
    description,
    icon,
    category,
    isAvailable
  },
  reviews[]{
    ...,
    traveller->{
      _id,
      name,
      slug,
      image
    }
  }
`

/**
 * Base query for property data (backward compatibility)
 */
const basePropertyFields = `
  _id,
  _rev,
  title,
  slug,
  location,
  propertyType,
  mainImage,
  images,
  pricePerNight,
  beds,
  bedrooms,
  description,
  host->{
    _id,
    name,
    slug,
    image
  },
  reviews[]{
    ...,
    traveller->{
      _id,
      name,
      slug,
      image
    }
  }
`

/**
 * Get all petting zoos and properties
 */
export const getAllZoosQuery = `{
  "pettingZoos": *[_type == "pettingZoo"] | order(name asc) {
    ${baseZooFields},
    "itemType": "pettingZoo"
  },
  "properties": *[_type == "property"] | order(title asc) {
    ${basePropertyFields},
    "itemType": "property"
  }
}`

/**
 * Get filtered petting zoos and properties
 * @param {Object} filters - Filter parameters
 * @returns {string} GROQ query
 */
export function getFilteredZoosQuery(filters = {}) {
  const { search, zooTypes, animalTypes, amenities, priceRange, rating } = filters
  
  let zooFilter = '_type == "pettingZoo"'
  let propertyFilter = '_type == "property"'
  
  // Add search filter
  if (search) {
    const searchCondition = `(name match "*${search}*" || description match "*${search}*" || zooType match "*${search}*")`
    zooFilter += ` && ${searchCondition}`
    
    const propertySearchCondition = `(title match "*${search}*" || description match "*${search}*" || propertyType match "*${search}*")`
    propertyFilter += ` && ${propertySearchCondition}`
  }
  
  // Add zoo type filter
  if (zooTypes && zooTypes.length > 0) {
    const zooTypeCondition = zooTypes.map(type => `zooType == "${type}"`).join(' || ')
    zooFilter += ` && (${zooTypeCondition})`
    
    const propertyTypeCondition = zooTypes.map(type => `propertyType == "${type}"`).join(' || ')
    propertyFilter += ` && (${propertyTypeCondition})`
  }
  
  // Add animal type filter (only for petting zoos)
  if (animalTypes && animalTypes.length > 0) {
    const animalCondition = animalTypes.map(animal => 
      `count(animals[species == "${animal}" || category == "${animal}"]) > 0`
    ).join(' || ')
    zooFilter += ` && (${animalCondition})`
  }
  
  // Add amenity filter (only for petting zoos)
  if (amenities && amenities.length > 0) {
    const amenityCondition = amenities.map(amenity => 
      `count(amenities[name == "${amenity}"]) > 0`
    ).join(' || ')
    zooFilter += ` && (${amenityCondition})`
  }
  
  return `{
    "pettingZoos": *[${zooFilter}] | order(name asc) {
      ${baseZooFields},
      "itemType": "pettingZoo"
    },
    "properties": *[${propertyFilter}] | order(title asc) {
      ${basePropertyFields},
      "itemType": "property"
    }
  }`
}

/**
 * Get a single petting zoo by slug
 * @param {string} slug - Zoo slug
 * @returns {string} GROQ query
 */
export const getZooBySlugQuery = (slug) => `
  *[_type == "pettingZoo" && slug.current == "${slug}"][0]{
    ${baseZooFields}
  }
`

/**
 * Get a single property by slug (backward compatibility)
 * @param {string} slug - Property slug
 * @returns {string} GROQ query
 */
export const getPropertyBySlugQuery = (slug) => `
  *[_type == "property" && slug.current == "${slug}"][0]{
    ${basePropertyFields}
  }
`

/**
 * Get filter options (unique values for filter dropdowns)
 */
export const getFilterOptionsQuery = `{
  "zooTypes": array::unique(*[_type == "pettingZoo" || _type == "property"].zooType[defined(@)] + *[_type == "pettingZoo" || _type == "property"].propertyType[defined(@)]),
  "animalTypes": array::unique(*[_type == "pettingZoo"].animals[]->species[defined(@)] + *[_type == "pettingZoo"].animals[]->category[defined(@)]),
  "amenities": array::unique(*[_type == "pettingZoo"].amenities[]->name[defined(@)])
}`

/**
 * Search suggestions query
 * @param {string} query - Search term
 * @returns {string} GROQ query
 */
export const getSearchSuggestionsQuery = (query) => `{
  "zoos": *[_type == "pettingZoo" && (name match "*${query}*" || description match "*${query}*")] | order(name asc) [0...5] {
    _id,
    name,
    zooType,
    slug
  },
  "properties": *[_type == "property" && (title match "*${query}*" || description match "*${query}*")] | order(title asc) [0...5] {
    _id,
    title,
    propertyType,
    slug
  }
}`

/**
 * Get zoos near a location (requires post-processing for distance calculation)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} GROQ query
 */
export const getZoosNearLocationQuery = (lat, lng) => `{
  "pettingZoos": *[_type == "pettingZoo" && defined(location)] {
    ${baseZooFields},
    "itemType": "pettingZoo",
    "distance": null
  },
  "properties": *[_type == "property" && defined(location)] {
    ${basePropertyFields},
    "itemType": "property", 
    "distance": null
  }
}`