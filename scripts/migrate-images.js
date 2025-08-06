#!/usr/bin/env node

/**
 * Image Migration Script: Organize and upload images to Sanity
 * 
 * This script processes local images, uploads them to Sanity, and creates
 * proper references for petting zoo documents.
 * 
 * Usage: node scripts/migrate-images.js [--dry-run] [--optimize]
 */

import { createClient } from '@sanity/client'
import { createReadStream, statSync, readdirSync } from 'fs'
import { join, extname, basename } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN,
})

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  optimize: process.argv.includes('--optimize'),
  imagesDir: './images',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  batchSize: 5 // Smaller batch size for image uploads
}

// Logging utility
const log = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
}

/**
 * Extracts zoo name from image filename
 */
function extractZooNameFromFilename(filename) {
  // Remove 'directory_' prefix and '_capybara' suffix, then clean up
  let zooName = filename
    .replace(/^directory_/, '')
    .replace(/_capybara$/, '')
    .replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')
  
  // Convert underscores to spaces and title case
  zooName = zooName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
  
  // Handle special cases
  const specialCases = {
    'Acuario Michin Puebla': 'Acuario Michin Puebla',
    'African Safari Wildlife Park': 'African Safari Wildlife Park',
    'Alabama Gulf Coast Zoo': 'Alabama Gulf Coast Zoo',
    'Amazing Animals': 'Amazing Animals',
    'Animal Adventure Park': 'Animal Adventure Park',
    'Animal World And Snake Farm Zoo': 'Animal World and Snake Farm Zoo',
    'Austin Zoo': 'Austin Zoo',
    'Cape May Zoo': 'Cape May Zoo',
    'Capybara Cafe El Campanario': 'Capybara Cafe El Campanario',
    'Capybara Cafe St Augustine': 'Capybara Cafe St Augustine',
    'Circle M': 'Circle M Ranch',
    'Clearwater Marine Aquarium': 'Clearwater Marine Aquarium',
    'Coastal Wilds': 'Coastal Wilds',
    'Country Kingdom': 'Country Kingdom',
    'Dallas': 'Dallas Zoo',
    'Darby Acres Farm': 'Darby Acres Farm',
    'Debbie Doolittle': 'Debbie Doolittle Animal Experience',
    'Eureka Springs': 'Eureka Springs Zoo',
    'Gatorland': 'Gatorland',
    'Ghost Ranch Exotics': 'Ghost Ranch Exotics',
    'Global Wildlife Center': 'Global Wildlife Center',
    'Greater Vancouver Zoo': 'Greater Vancouver Zoo',
    'Gulf Breeze Zoo': 'Gulf Breeze Zoo',
    'Hattiesburg Zoo': 'Hattiesburg Zoo',
    'Highpoint Haven': 'Highpoint Haven',
    'Its A Zoo Life': "It's a Zoo Life",
    'Jungle Experience Zoo': 'Jungle Experience Zoo',
    'Jungle Island': 'Jungle Island',
    'Kangaroo Creek Farm': 'Kangaroo Creek Farm',
    'Kentucky Down Under': 'Kentucky Down Under Adventure Zoo',
    'Lake Tobias Wildlife Park': 'Lake Tobias Wildlife Park',
    'Little Bear Capybara Farm': 'Little Bear Capybara Farm',
    'Long Island Game Farm': 'Long Island Game Farm',
    'Memphis Zoo': 'Memphis Zoo',
    'North Georgia Wildlife Park': 'North Georgia Wildlife Park',
    'Nova Wild Formerly Reston Zoo': 'Nova Wild (formerly Reston Zoo)',
    'Nurtured By Nature Animal Educators': 'Nurtured by Nature Animal Educators',
    'Palm Beach Zoo Dreher Park': 'Palm Beach Zoo & Dreher Park Zoo',
    'Phoenix Herpetological Sanctuary': 'Phoenix Herpetological Sanctuary',
    'Pine Meadow Alpaca Farm': 'Pine Meadow Alpaca Farm',
    'Safari Lake Geneva': 'Safari Lake Geneva',
    'Summerfield Zoo': 'Summerfield Zoo',
    'Tanganyika Wildlife Park': 'Tanganyika Wildlife Park',
    'The Healing Farm': 'The Healing Farm',
    'Toronto Zoo': 'Toronto Zoo',
    'Wild Florida': 'Wild Florida',
    'Yorks Wild Kingdom': "York's Wild Kingdom",
    'Zoo To You': 'Zoo To You',
    'Zoo World Panama': 'Zoo World Panama City Beach'
  }
  
  return specialCases[zooName] || zooName
}/
**
 * Validates an image file
 */
function validateImageFile(filePath) {
  const errors = []
  const warnings = []
  
  try {
    const stats = statSync(filePath)
    const ext = extname(filePath).toLowerCase()
    
    // Check file extension
    if (!config.supportedFormats.includes(ext)) {
      errors.push(`Unsupported format: ${ext}`)
    }
    
    // Check file size
    if (stats.size > config.maxFileSize) {
      errors.push(`File too large: ${(stats.size / 1024 / 1024).toFixed(2)}MB (max: ${config.maxFileSize / 1024 / 1024}MB)`)
    }
    
    // Check if file is empty
    if (stats.size === 0) {
      errors.push('File is empty')
    }
    
    // Warn about very small files (likely thumbnails or low quality)
    if (stats.size < 10 * 1024) { // Less than 10KB
      warnings.push('File is very small, may be low quality')
    }
    
  } catch (error) {
    errors.push(`Cannot access file: ${error.message}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Scans the images directory and categorizes files
 */
function scanImageDirectory() {
  try {
    log.info(`Scanning images directory: ${config.imagesDir}`)
    
    const files = readdirSync(config.imagesDir)
    const imageFiles = files.filter(file => {
      const ext = extname(file).toLowerCase()
      return config.supportedFormats.includes(ext)
    })
    
    log.info(`Found ${imageFiles.length} image files`)
    
    const categorizedImages = {
      zooImages: [],
      logoImages: [],
      uncategorized: []
    }
    
    imageFiles.forEach(filename => {
      const filePath = join(config.imagesDir, filename)
      const validation = validateImageFile(filePath)
      
      if (!validation.isValid) {
        log.warn(`Skipping invalid file ${filename}: ${validation.errors.join(', ')}`)
        return
      }
      
      if (validation.warnings.length > 0) {
        log.warn(`Warnings for ${filename}: ${validation.warnings.join(', ')}`)
      }
      
      // Categorize images
      if (filename.includes('logo')) {
        categorizedImages.logoImages.push({
          filename,
          filePath,
          type: 'logo'
        })
      } else if (filename.startsWith('directory_')) {
        const zooName = extractZooNameFromFilename(filename)
        categorizedImages.zooImages.push({
          filename,
          filePath,
          zooName,
          type: 'zoo'
        })
      } else {
        categorizedImages.uncategorized.push({
          filename,
          filePath,
          type: 'uncategorized'
        })
      }
    })
    
    log.info(`Categorized images:`)
    log.info(`  Zoo images: ${categorizedImages.zooImages.length}`)
    log.info(`  Logo images: ${categorizedImages.logoImages.length}`)
    log.info(`  Uncategorized: ${categorizedImages.uncategorized.length}`)
    
    return categorizedImages
    
  } catch (error) {
    log.error('Failed to scan images directory:', error.message)
    throw error
  }
}

/**
 * Uploads an image to Sanity
 */
async function uploadImageToSanity(imageInfo) {
  try {
    log.info(`Uploading ${imageInfo.filename}...`)
    
    if (config.dryRun) {
      log.info(`[DRY RUN] Would upload ${imageInfo.filename}`)
      return {
        _type: 'image',
        asset: {
          _ref: `image-mock-${Date.now()}-jpg`,
          _type: 'reference'
        }
      }
    }
    
    const stream = createReadStream(imageInfo.filePath)
    const asset = await client.assets.upload('image', stream, {
      filename: imageInfo.filename,
      title: imageInfo.zooName || basename(imageInfo.filename, extname(imageInfo.filename))
    })
    
    log.info(`Successfully uploaded ${imageInfo.filename} (${asset._id})`)
    
    return {
      _type: 'image',
      asset: {
        _ref: asset._id,
        _type: 'reference'
      },
      alt: imageInfo.zooName ? `${imageInfo.zooName} petting zoo` : 'Petting zoo image'
    }
    
  } catch (error) {
    log.error(`Failed to upload ${imageInfo.filename}:`, error.message)
    throw error
  }
}/**
 * C
reates image references for petting zoo documents
 */
async function createImageReferences(categorizedImages) {
  const imageReferences = new Map()
  
  // Process zoo images
  for (const imageInfo of categorizedImages.zooImages) {
    try {
      const uploadedImage = await uploadImageToSanity(imageInfo)
      
      if (!imageReferences.has(imageInfo.zooName)) {
        imageReferences.set(imageInfo.zooName, {
          mainImage: null,
          additionalImages: []
        })
      }
      
      const zooImages = imageReferences.get(imageInfo.zooName)
      
      // First image becomes main image
      if (!zooImages.mainImage) {
        zooImages.mainImage = uploadedImage
      } else {
        zooImages.additionalImages.push({
          _type: 'propertyImage',
          _key: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          image: uploadedImage,
          caption: `${imageInfo.zooName} facility`
        })
      }
      
    } catch (error) {
      log.error(`Failed to process image for ${imageInfo.zooName}:`, error.message)
    }
  }
  
  // Process logo images
  const logoImages = []
  for (const imageInfo of categorizedImages.logoImages) {
    try {
      const uploadedImage = await uploadImageToSanity(imageInfo)
      logoImages.push(uploadedImage)
    } catch (error) {
      log.error(`Failed to process logo image:`, error.message)
    }
  }
  
  return {
    zooImageReferences: imageReferences,
    logoImages
  }
}

/**
 * Updates petting zoo documents with image references
 */
async function updateZooDocumentsWithImages(imageReferences) {
  if (config.dryRun) {
    log.info(`[DRY RUN] Would update ${imageReferences.size} zoo documents with images`)
    imageReferences.forEach((images, zooName) => {
      log.info(`  ${zooName}: main image + ${images.additionalImages.length} additional images`)
    })
    return { updated: imageReferences.size, errors: [] }
  }
  
  const results = { updated: 0, errors: [] }
  
  // Fetch existing petting zoo documents
  try {
    const zoos = await client.fetch(`
      *[_type == "pettingZoo"] {
        _id,
        _rev,
        name,
        mainImage,
        images
      }
    `)
    
    log.info(`Found ${zoos.length} petting zoo documents to update`)
    
    for (const zoo of zoos) {
      const zooImages = imageReferences.get(zoo.name)
      
      if (!zooImages) {
        log.warn(`No images found for zoo: ${zoo.name}`)
        continue
      }
      
      try {
        const updates = {}
        
        // Update main image if not already set
        if (!zoo.mainImage && zooImages.mainImage) {
          updates.mainImage = zooImages.mainImage
        }
        
        // Add additional images
        if (zooImages.additionalImages.length > 0) {
          updates.images = [
            ...(zoo.images || []),
            ...zooImages.additionalImages
          ]
        }
        
        if (Object.keys(updates).length > 0) {
          await client.patch(zoo._id).set(updates).commit()
          results.updated++
          log.info(`Updated ${zoo.name} with ${Object.keys(updates).length} image fields`)
        } else {
          log.info(`No image updates needed for ${zoo.name}`)
        }
        
      } catch (error) {
        log.error(`Failed to update ${zoo.name}:`, error.message)
        results.errors.push({
          zooName: zoo.name,
          zooId: zoo._id,
          error: error.message
        })
      }
    }
    
  } catch (error) {
    log.error('Failed to fetch zoo documents:', error.message)
    throw error
  }
  
  return results
}

/**
 * Main image migration function
 */
async function migrateImages() {
  try {
    log.info('Starting image migration...')
    log.info(`Configuration: ${JSON.stringify(config, null, 2)}`)
    
    // Step 1: Scan and categorize images
    const categorizedImages = scanImageDirectory()
    
    if (categorizedImages.zooImages.length === 0) {
      log.info('No zoo images found to migrate')
      return
    }
    
    // Step 2: Upload images and create references
    log.info('Uploading images to Sanity...')
    const { zooImageReferences, logoImages } = await createImageReferences(categorizedImages)
    
    // Step 3: Update petting zoo documents
    log.info('Updating petting zoo documents with image references...')
    const results = await updateZooDocumentsWithImages(zooImageReferences)
    
    // Step 4: Report results
    log.info('Image migration complete!')
    log.info(`  Zoo documents updated: ${results.updated}`)
    log.info(`  Logo images uploaded: ${logoImages.length}`)
    log.info(`  Errors: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      log.error('Errors during image migration:')
      results.errors.forEach(error => {
        log.error(`  ${error.zooName} (${error.zooId}): ${error.error}`)
      })
    }
    
    // Report uncategorized images
    if (categorizedImages.uncategorized.length > 0) {
      log.warn('Uncategorized images found:')
      categorizedImages.uncategorized.forEach(img => {
        log.warn(`  ${img.filename}`)
      })
    }
    
  } catch (error) {
    log.error('Image migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateImages()
    .then(() => {
      log.info('Image migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      log.error('Image migration script failed:', error.message)
      process.exit(1)
    })
}

export { migrateImages, extractZooNameFromFilename, validateImageFile }