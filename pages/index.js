import { sanityClient } from "../sanity"
import DashboardMap from "../components/DashboardMap"
import PettingZooCard from "../components/PettingZooCard"
import Head from "next/head"
import { useState, useEffect } from "react"

const Home = ({ pettingZoos: initialPettingZoos, error }) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  console.log('Home component received:', { pettingZoos: initialPettingZoos, error })

  if (error) {
    return <div>Error: {error}</div>
  }

  if (!initialPettingZoos) {
    return <div>No data received</div>
  }



  return (
    <>
      <Head>
        <title>Petting Zoo Directory - Find Amazing Petting Zoos Near You</title>
        <meta name="description" content="Discover the best petting zoos in your area. Meet friendly animals, read visitor reviews, see photos, and plan your perfect family visit." />
        <meta name="keywords" content="petting zoo, family fun, animals, kids activities, farm animals, interactive experiences" />
        <meta property="og:title" content="Petting Zoo Directory - Find Amazing Petting Zoos Near You" />
        <meta property="og:description" content="Discover the best petting zoos in your area. Meet friendly animals and plan your perfect family visit." />
        <meta property="og:type" content="website" />
        <html lang="en" />
      </Head>
      <div className="main">
        <div className="feed-container">
          <h1>Discover Amazing Petting Zoos</h1>
          <p>Found {initialPettingZoos.length} petting zoos</p>

          <div className="feed">
            {initialPettingZoos.map((zoo) => (
              <PettingZooCard key={zoo._id} zoo={zoo} />
            ))}
          </div>
        </div>
        <div className="map">
          {isClient && <DashboardMap pettingZoos={initialPettingZoos} />}
        </div>
      </div>
    </>
  )
}

export const getServerSideProps = async () => {
  try {
    console.log('Fetching petting zoo data...')

    // Simplified query to avoid reference issues
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
      "pricePerNight": admissionPrice.adult
    }`

    const pettingZoos = await sanityClient.fetch(pettingZooQuery)
    console.log(`Found ${pettingZoos.length} petting zoos`)

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
        error: error.message
      },
    }
  }
}

export default Home
