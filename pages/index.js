import { sanityClient } from "../sanity"
import DashboardMap from "../components/DashboardMap"
import PettingZooCard from "../components/PettingZooCard"
import PropertyCard from "../components/PropertyCard"
import Head from "next/head"

const Home = ({ properties }) => {
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
            <div className="feed">
              {properties.map((item) => (
                item.itemType === 'pettingZoo' ? (
                  <PettingZooCard key={item._id} zoo={item} />
                ) : (
                  <PropertyCard key={item._id} property={item} />
                )
              ))}
            </div>
          </div>
          <div className="map">
            <DashboardMap properties={properties} />
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
