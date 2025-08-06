import { sanityClient } from "../../sanity"
import { isMultiple } from "../../utils"
import Image from "../../components/Image"
import Review from "../../components/Review"
import Map from "../../components/Map"
import Link from "next/link"
import Head from "next/head"

const PettingZoo = ({
  name,
  location,
  zooType,
  mainImage,
  images,
  admissionPrice,
  animalCount,
  animalTypes,
  description,
  owner,
  reviews,
  address,
  phone,
  website,
  operatingHours,
}) => {
  const reviewAmount = reviews?.length || 0

  return (
    <div className="container">
      <Head>
        <title>{name || 'Petting Zoo'} - Petting Zoo Directory</title>
        <meta name="description" content={description || 'Petting zoo information'} />
      </Head>
      <h1>
        <b>{name || 'Petting Zoo'}</b>
      </h1>
      <p>
        {reviewAmount} review{isMultiple(reviewAmount)}
      </p>
      <div className="images-section">
        {mainImage && <Image identifier="main-image" image={mainImage} />}
        <div className="sub-images-section">
          {images?.map(({ _key, asset }) => (
            <Image key={_key} identifier="image" image={asset} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="information">
          <h2>
            <b>
              {zooType || 'Petting Zoo'} {owner?.name ? `managed by ${owner.name}` : ''}
            </b>
          </h2>
          <h4>
            {animalTypes || 0} animal type{isMultiple(animalTypes || 0)} * {animalCount || 0} animal
            {isMultiple(animalCount || 0)}
          </h4>
          <hr />
          <h4>
            <b>Animal Care Standards</b>
          </h4>
          <p>
            This zoo is committed to high standards of animal care and visitor safety.
          </p>
          <h4>
            <b>Facilities Available</b>
          </h4>
          <p>
            The zoo includes parking, restrooms, gift shop, and picnic areas for families.
          </p>
          <h4>
            <b>Visitor Guidelines</b>
          </h4>
          <p>
            Please follow all posted signs, supervise children at all times, and respect the animals.
          </p>
          
          {address && (
            <>
              <h4><b>Address</b></h4>
              <p>{address}</p>
            </>
          )}
          
          {phone && (
            <>
              <h4><b>Phone</b></h4>
              <p>{phone}</p>
            </>
          )}
          
          {website && (
            <>
              <h4><b>Website</b></h4>
              <p><a href={website} target="_blank" rel="noopener noreferrer">{website}</a></p>
            </>
          )}
        </div>
        <div className="price-box">
          <h2>£{admissionPrice?.adult || 0} Admission</h2>
          {admissionPrice?.child && (
            <p>Children: £{admissionPrice.child}</p>
          )}
          {admissionPrice?.senior && (
            <p>Seniors: £{admissionPrice.senior}</p>
          )}
          <h4>
            {reviewAmount} review{isMultiple(reviewAmount)}
          </h4>
          <Link href="/">
            <div className="button">Back to Directory</div>
          </Link>
        </div>
      </div>

      <hr />

      <h4>{description}</h4>

      <hr />

      <h2>
        {reviewAmount} review{isMultiple(reviewAmount)}
      </h2>
      {reviewAmount > 0 &&
        reviews.map((review) => <Review key={review._key} review={review} />)}

      <hr />

      <h2>Location</h2>
      <Map location={location}></Map>
    </div>
  )
}

export const getServerSideProps = async (pageContext) => {
  const pageSlug = pageContext.query.slug

  const query = `*[ _type == "pettingZoo" && slug.current == $pageSlug][0]{
    name,
    location,
    zooType,
    mainImage,
    images,
    admissionPrice,
    animalCount,
    animalTypes,
    description,
    address,
    phone,
    website,
    operatingHours,
    owner->{
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
  }`

  const pettingZoo = await sanityClient.fetch(query, { pageSlug })

  console.log('Fetched petting zoo:', pettingZoo)
  console.log('Page slug:', pageSlug)

  if (!pettingZoo) {
    return {
      props: null,
      notFound: true,
    }
  } else {
    return {
      props: {
        name: pettingZoo.name || null,
        location: pettingZoo.location || null,
        zooType: pettingZoo.zooType || null,
        mainImage: pettingZoo.mainImage || null,
        images: pettingZoo.images || null,
        admissionPrice: pettingZoo.admissionPrice || null,
        animalCount: pettingZoo.animalCount || null,
        animalTypes: pettingZoo.animalTypes || null,
        description: pettingZoo.description || null,
        address: pettingZoo.address || null,
        phone: pettingZoo.phone || null,
        website: pettingZoo.website || null,
        operatingHours: pettingZoo.operatingHours || null,
        owner: pettingZoo.owner || null,
        reviews: pettingZoo.reviews || [],
      },
    }
  }
}

export default PettingZoo