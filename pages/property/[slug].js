import { sanityClient } from "../../sanity"
import { isMultiple } from "../../utils"
import Image from "../../components/Image"
import Review from "../../components/Review"
import Map from "../../components/Map"
import Link from "next/link"

const Property = ({
  title,
  location,
  propertyType,
  mainImage,
  images,
  pricePerNight,
  beds,
  bedrooms,
  description,
  host,
  reviews,
}) => {
  const reviewAmount = reviews.length

  console.log(images)
  return (
    <div className="container">
      <h1>
        <b>{title}</b>
      </h1>
      <p>
        {reviewAmount} review{isMultiple(reviewAmount)}
      </p>
      <div className="images-section">
        <Image identifier="main-image" image={mainImage} />
        <div className="sub-images-section">
          {images.map(({ _key, asset }, image) => (
            <Image key={_key} identifier="image" image={asset} />
          ))}
        </div>
      </div>

      <div className="section">
        <div className="information">
          <h2>
            <b>
              {propertyType} managed by {host?.name}
            </b>
          </h2>
          <h4>
            {bedrooms} animal type{isMultiple(bedrooms)} * {beds} animal
            {isMultiple(beds)}
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
        </div>
        <div className="price-box">
          <h2>£{pricePerNight} Admission</h2>
          <h4>
            {reviewAmount} review{isMultiple(reviewAmount)}
          </h4>
          <Link href="/">
            <div className="button">Visit Zoo</div>
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

  const query = `*[ _type == "property" && slug.current == $pageSlug][0]{
    title,
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
  }`

  const property = await sanityClient.fetch(query, { pageSlug })

  if (!property) {
    return {
      props: null,
      notFound: true,
    }
  } else {
    return {
      props: {
        title: property.title,
        location: property.location,
        propertyType: property.propertyType,
        mainImage: property.mainImage,
        images: property.images,
        pricePerNight: property.pricePerNight,
        beds: property.beds,
        bedrooms: property.bedrooms,
        description: property.description,
        host: property.host,
        reviews: property.reviews,
      },
    }
  }
}

export default Property
