import { sanityClient } from "../sanity"
import DashboardMap from "../components/DashboardMap"
import PettingZooCard from "../components/PettingZooCard"
import PropertyCard from "../components/PropertyCard"
import SimpleSearchBar from "../components/SimpleSearchBar"
import FilterPanel from "../components/FilterPanel"
import ShareButton from "../components/ShareButton"
import Head from "next/head"
import { useState, useEffect } from "react"
import { applyFilters, getFilterSummary } from "../utils/filterUtils"
import { useSearchState, useFiltersState } from "../hooks/useUrlState"

const Home = ({ properties: initialProperties }) => {
  const [properties, setProperties] = useState(initialProperties)
  const [filteredProperties, setFilteredProperties] = useState(initialProperties)
  
  // URL state management
  const [searchTerm, setSearchTerm] = useSearchState("")
  const [filters, setFilters] = useFiltersState({
    zooTypes: [],
    animalTypes: [],
    amenities: [],
    distance: 'all',
    priceRange: 'all',
    rating: 'all'
  })
  
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false)
  const [userLocation, setUserLocation] = useState(null)

  // Apply both search and filters
  useEffect(() => {
    let filtered = properties

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(property => {
        const name = property.name || property.title || ""
        const description = property.description || ""
        const zooType = property.zooType || property.propertyType || ""
        
        const searchLower = searchTerm.toLowerCase()
        
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          zooType.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply advanced filters
    filtered = applyFilters(filtered, filters, userLocation)
    
    setFilteredProperties(filtered)
  }, [searchTerm, filters, properties, userLocation])

  const handleSearch = (term) => {
    setSearchTerm(term)
  }

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters)
  }

  const toggleFilterPanel = () => {
    setIsFilterPanelOpen(!isFilterPanelOpen)
  }

  // Get user location for distance filtering
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or unavailable')
        }
      )
    }
  }, [])

  console.log(properties)
  return (
    <>
      <Head>
        <title>Petting Zoo Directory - Find Local Petting Zoos</title>
        <meta name="description" content="Discover amazing petting zoos near you. Read reviews, see photos, and plan your visit." />
      </Head>
      {properties && (
        <div className="main">
          <div className="feed-container">
            <h1>Petting Zoos near you</h1>
            
            <SimpleSearchBar 
              onSearch={handleSearch}
              placeholder="Search petting zoos by name, type, or description..."
            />
            
            <FilterPanel
              properties={properties}
              onFiltersChange={handleFiltersChange}
              userLocation={userLocation}
              isOpen={isFilterPanelOpen}
              onToggle={toggleFilterPanel}
            />
            
            <div className="search-results-info">
              <div className="results-header">
                <p className="results-count">
                  {getFilterSummary(filters, properties.length, filteredProperties.length)}
                  {searchTerm && ` (search: "${searchTerm}")`}
                </p>
                <ShareButton searchTerm={searchTerm} filters={filters} />
              </div>
            </div>
            
            <div className="feed">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((item) => (
                  item.itemType === 'pettingZoo' ? (
                    <PettingZooCard key={item._id} zoo={item} />
                  ) : (
                    <PropertyCard key={item._id} property={item} />
                  )
                ))
              ) : (
                <div className="no-results">
                  <h3>No petting zoos found</h3>
                  <p>
                    {searchTerm 
                      ? `No results match "${searchTerm}". Try a different search term.`
                      : "No petting zoos are currently available."
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="map">
            <DashboardMap properties={filteredProperties} />
          </div>
        </div>
      )}
    </>
  )
}

export const getServerSideProps = async () => {
  try {
    // Fetch both properties and petting zoos
    const propertyQuery = `*[ _type == "property"]{
      ...,
      reviews,
      "itemType": "property"
    }`
    const pettingZooQuery = `*[ _type == "pettingZoo"]{
      ...,
      reviews,
      "itemType": "pettingZoo",
      "title": name,
      "pricePerNight": admissionPrice.adult
    }`
    
    const properties = await sanityClient.fetch(propertyQuery)
    const pettingZoos = await sanityClient.fetch(pettingZooQuery)
    
    // Combine both arrays
    const allItems = [...properties, ...pettingZoos]

    return {
      props: {
        properties: allItems,
      },
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return {
      props: {
        properties: [],
      },
    }
  }
}

export default Home
