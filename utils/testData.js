/**
 * Test data for development and debugging
 * Includes properly formatted image data for testing SafeImage component
 */

// Mock Sanity image data structure for testing
export const mockCapybaraImage = {
  asset: {
    _ref: "image-capybara123-800x600-jpg",
    _type: "reference"
  },
  alt: "Capybara at Acuario Michin Puebla",
  caption: "Friendly capybara enjoying the water at Acuario Michin Puebla",
  hotspot: null,
  crop: null,
  _type: "image"
}

// Test petting zoo data with the capybara image
export const testPettingZoo = {
  _id: "test-zoo-capybara",
  _type: "pettingZoo",
  name: "Acuario Michin Puebla",
  slug: {
    current: "acuario-michin-puebla",
    _type: "slug"
  },
  description: "A wonderful aquarium and petting zoo featuring friendly capybaras and other amazing animals.",
  mainImage: mockCapybaraImage,
  images: [mockCapybaraImage],
  location: {
    lat: 19.0414,
    lng: -98.2063,
    address: "Puebla, Mexico"
  },
  admissionPrice: {
    adult: 150,
    child: 100,
    currency: "MXN"
  },
  zooType: "Aquarium & Petting Zoo",
  animalCount: 25,
  animalTypes: 8,
  reviews: [],
  amenities: ["Parking", "Gift Shop", "Restrooms", "Food Court"],
  animals: ["Capybara", "Fish", "Turtles", "Birds"],
  contactInfo: {
    phone: "+52-222-123-4567",
    email: "info@acuariomichin.com"
  },
  hours: {
    monday: "9:00 AM - 6:00 PM",
    tuesday: "9:00 AM - 6:00 PM",
    wednesday: "9:00 AM - 6:00 PM",
    thursday: "9:00 AM - 6:00 PM",
    friday: "9:00 AM - 8:00 PM",
    saturday: "8:00 AM - 8:00 PM",
    sunday: "8:00 AM - 6:00 PM"
  },
  website: "https://acuariomichin.com"
}

// Various broken image scenarios for testing
export const brokenImageScenarios = [
  {
    name: "Null Image",
    zoo: { ...testPettingZoo, mainImage: null }
  },
  {
    name: "Missing Asset",
    zoo: { 
      ...testPettingZoo, 
      mainImage: { alt: "Missing asset", caption: "This will fail" }
    }
  },
  {
    name: "String Instead of Object",
    zoo: { 
      ...testPettingZoo, 
      mainImage: "/images/directory_acuario_michin_puebla_capybara.jpg"
    }
  },
  {
    name: "Empty Object",
    zoo: { ...testPettingZoo, mainImage: {} }
  }
]

// Function to add test data to your existing zoo list
export function addTestDataToZoos(existingZoos = []) {
  return [
    testPettingZoo,
    ...brokenImageScenarios.map(scenario => scenario.zoo),
    ...existingZoos
  ]
}