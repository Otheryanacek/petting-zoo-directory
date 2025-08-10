import { urlFor } from "../sanity"

const Image = ({ identifier, image }) => {
  // Handle null/undefined images
  if (!image) {
    return (
      <div className={identifier === "main-image" ? "main-image" : "image"}>
        <div className="image-placeholder">
          <span>📷</span>
          <p>No image available</p>
        </div>
      </div>
    )
  }

  return (
    <div className={identifier === "main-image" ? "main-image" : "image"}>
      <img src={urlFor(image).auto("format")} alt="Zoo image" />
    </div>
  )
}

export default Image
