import { sanityClient } from "../sanity"
import DashboardMap from "../components/DashboardMap"
import PettingZooCard from "../components/PettingZooCard"
import SimpleSearchBar from "../components/SimpleSearchBar"
import FilterPanel from "../components/FilterPanel"
import ShareButton from "../components/ShareButton"
import Head from "next/head"
import { useState, useEffect } from "react"
import { applyFilters, getFilterSummary } from "../utils/filterUtils"
import { useSearchState, useFiltersState } from "../hooks/useUrlState"

const Home = ({ pettingZoos: initialPettingZoos }) => {
  const [pettingZoos, setPettingZoos] = useState(initialPettingZoos)
  const [filteredPettingZoos, setFilteredPettingZoos] = useState(initialPettingZoos)
  
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
    let filtered = pettingZoos

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(zoo => {
        const name = zoo.name || zoo.title || ""
        const description = zoo.description || ""
        const zooType = zoo.zooType || ""
        const address = zoo.address || ""
        
        const searchLower = searchTerm.toLowerCase()
        
        return (
          name.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          zooType.toLowerCase().includes(searchLower) ||
          address.toLowerCase().includes(searchLower)
        )
      })
    }

    // Apply advanced filters
    filtered = applyFilters(filtered, filters, userLocation)
    
    setFilteredPettingZoos(filtered)
  }, [searchTerm, filters, pettingZoos, userLocation])

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
        <title>Petting Zoo Directory - Find Amazing Petting Zoos Near You</title>
        <meta name="description" content="Discover the best petting zoos in your area. Meet friendly animals, read visitor reviews, see photos, and plan your perfect family visit." />
        <meta name="keywords" content="petting zoo, family fun, animals, kids activities, farm animals, interactive experiences" />
        <meta property="og:title" content="Petting Zoo Directory - Find Amazing Petting Zoos Near You" />
        <meta property="og:description" content="Discover the best petting zoos in your area. Meet friendly animals and plan your perfect family visit." />
        <meta property="og:type" content="website" />
      </Head>
      {pettingZoos && (
        <div className="main">
          <div className="feed-container">
            <h1>Discover Amazing Petting Zoos</h1>
            <p className="page-subtitle">Find the perfect petting zoo for your family adventure. Meet friendly animals, enjoy hands-on experiences, and create lasting memories.</p>
            
            <SimpleSearchBar 
              onSearch={handleSearch}
              placeholder="Search petting zoos by name, location, or animal types..."
            />
            
            <FilterPanel
              properties={pettingZoos}
              onFiltersChange={handleFiltersChange}
              userLocation={userLocation}
              isOpen={isFilterPanelOpen}
              onToggle={toggleFilterPanel}
            />
            
            <div className="search-results-info">
              <div className="results-header">
                <p className="results-count">
                  {getFilterSummary(filters, pettingZoos.length, filteredPettingZoos.length)}
                  {searchTerm && ` (search: "${searchTerm}")`}
                </p>
                <ShareButton searchTerm={searchTerm} filters={filters} />
              </div>
            </div>
            
            <div className="feed">
              {filteredPettingZoos.length > 0 ? (
                filteredPettingZoos.map((zoo) => (
                  <PettingZooCard key={zoo._id} zoo={zoo} />
                ))
              ) : (
                <div className="no-results">
                  <h3>No petting zoos found</h3>
                  <p>
                    {searchTerm 
                      ? `No petting zoos match "${searchTerm}". Try searching for different animals, locations, or zoo names.`
                      : "No petting zoos are currently available in our directory. Check back soon for new additions!"
                    }
                  </p>
                  <div className="no-results-suggestions">
                    <h4>Try searching for:</h4>
                    <ul>
                      <li>Farm animals (goats, sheep, pigs)</li>
                      <li>Small animals (rabbits, guinea pigs)</li>
                      <li>Your city or nearby locations</li>
                      <li>Specific zoo names</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="map">
            <DashboardMap pettingZoos={filteredPettingZoos} />
          </div>
        </div>
      )}
    </>
  )
}

export const getServerSideProps = async () => {
  try {
    // Fetch only petting zoos for the directory
    const pettingZooQuery = `*[ _type == "pettingZoo"] | order(name asc) {
      _id,
      name,
      slug,
      description,
      mainImage,
      images,
      location,
      address,
      phone,
      website,
      zooType,
      admissionPrice,
      animalCount,
      animalTypes,
      operatingHours,
      reviews,
      "itemType": "pettingZoo",
      "title": name,
      "pricePerNight": admissionPrice.adult,
      animals[]->{
        _id,
        name,
        species,
        category
      },
      amenities[]->{
        _id,
        name,
        category
      }
    }`
    
    const pettingZoos = await sanityClient.fetch(pettingZooQuery)

    return {
      props: {
        pettingZoos: pettingZoos || [],
      },
    }
  } catch (error) {
    console.error('Error fetching petting zoo data:', error)
    return {
      props: {
        pettingZoos: [],
      },
    }
  }
}

export default Home
