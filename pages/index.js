import { sanityClient, urlFor } from "../sanity"
import Link from "next/link"
import { isMultiple } from "../utils"
import DashboardMap from "../components/DashboardMap"
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
              {properties.map((property) => (
                <Link href={`${property.itemType === 'pettingZoo' ? 'zoo' : 'property'}/${property.slug.current}`}>
                  <div key={property._id} className="card">
                    <img src={urlFor(property.mainImage)} />
                    <p>
                      {property.reviews?.length || 0} review
                      {isMultiple(property.reviews?.length || 0)}
                    </p>
                    <h3>{property.title}</h3>
                    <h3>
                      <b>£{property.pricePerNight} Admission</b>
                    </h3>
                  </div>
                </Link>
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
}

export default Home
