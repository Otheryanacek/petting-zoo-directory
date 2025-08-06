#!/usr/bin/env node

/**
 * Data Migration Script: Properties to Petting Zoos
 * 
 * This script migrates existing property data to the new petting zoo schema.
 * It handles field mapping, data validation, and error cases.
 * 
 * Usage: node scripts/migrate-properties-to-zoos.js [--dry-run] [--batch-size=10]
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: process.env.SANITY_API_TOKEN, // Required for write operations
})

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  batchSize: parseInt(process.argv.find(arg => arg.startsWith('--batch-size='))?.split('=')[1]) || 10,
  logLevel: 'info' // 'debug', 'info', 'warn', 'error'
}

// Logging utility
const log = {
  debug: (msg, data) => config.logLevel === 'debug' && console.log(`[DEBUG] ${msg}`, data || ''),
  info: (msg, data) => ['debug', 'info'].includes(config.logLevel) && console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => ['debug', 'info', 'warn'].includes(config.logLevel) && console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
}

/**
 * Field mapping configuration from property schema to petting zoo schema
 */
const fieldMapping = {
  // Direct mappings
  title: 'name',
  location: 'location',
  mainImage: 'mainImage',
  images: 'images',
  slug: 'slug',
  description: 'description',
  host: 'owner',
  reviews: 'reviews',
  
  // Transformed mappings
  propertyType: 'zooType',
  pricePerNight: (value) => ({
    adult: value,
    child: Math.round(value * 0.7), // 30% discount for children
    senior: Math.round(value * 0.8)  // 20% discount for seniors
  }),
  beds: 'animalCount',
  bedrooms: 'animalTypes'
}

/**
 * Validates a property document before migration
 */
function validateProperty(property) {
  const errors = []
  const warnings = []
  
  if (!property.title) {
    errors.push('Missing required field: title')
  }
  
  if (!property.slug?.current) {
    errors.push('Missing required field: slug')
  }
  
  if (!property.location) {
    warnings.push('Missing location data - zoo will not appear on map')
  }
  
  if (!property.mainImage) {
    warnings.push('Missing main image - using placeholder')
  }
  
  if (!property.description) {
    warnings.push('Missing description - will use default text')
  }
  
  return { errors, warnings, isValid: errors.length === 0 }
}/**
 * Tra
nsforms a property document to petting zoo format
 */
function transformPropertyToZoo(property) {
  const zoo = {
    _type: 'pettingZoo',
    _id: `pettingZoo-${property._id}`, // New ID to avoid conflicts
  }
  
  // Apply field mappings
  Object.entries(fieldMapping).forEach(([propertyField, zooFieldOrTransform]) => {
    if (property[propertyField] !== undefined) {
      if (typeof zooFieldOrTransform === 'function') {
        // Apply transformation function
        const transformedValue = zooFieldOrTransform(property[propertyField])
        if (propertyField === 'pricePerNight') {
          zoo.admissionPrice = transformedValue
        }
      } else if (typeof zooFieldOrTransform === 'string') {
        // Direct field mapping
        zoo[zooFieldOrTransform] = property[propertyField]
      }
    }
  })
  
  // Handle special cases and defaults
  if (!zoo.description && property.title) {
    zoo.description = `Welcome to ${property.title}! A wonderful petting zoo experience awaits you and your family.`
  }
  
  // Set default operating hours if not provided
  if (!zoo.operatingHours) {
    zoo.operatingHours = {
      monday: '9:00 AM - 5:00 PM',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: '10:00 AM - 5:00 PM'
    }
  }
  
  // Generate address from location if available
  if (property.location && !zoo.address) {
    zoo.address = `${property.location.lat.toFixed(4)}, ${property.location.lng.toFixed(4)}`
  }
  
  return zoo
}

/**
 * Fetches all property documents from Sanity
 */
async function fetchProperties() {
  try {
    log.info('Fetching property documents...')
    const properties = await client.fetch(`
      *[_type == "property"] {
        _id,
        _rev,
        title,
        location,
        propertyType,
        mainImage,
        images,
        pricePerNight,
        beds,
        bedrooms,
        slug,
        description,
        host,
        reviews
      }
    `)
    
    log.info(`Found ${properties.length} property documents`)
    return properties
  } catch (error) {
    log.error('Failed to fetch properties:', error.message)
    throw error
  }
}

/**
 * Creates petting zoo documents in batches
 */
async function createPettingZoos(zoos) {
  if (config.dryRun) {
    log.info(`[DRY RUN] Would create ${zoos.length} petting zoo documents`)
    return { created: zoos.length, errors: [] }
  }
  
  const results = { created: 0, errors: [] }
  
  // Process in batches to avoid overwhelming the API
  for (let i = 0; i < zoos.length; i += config.batchSize) {
    const batch = zoos.slice(i, i + config.batchSize)
    log.info(`Processing batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(zoos.length / config.batchSize)}`)
    
    try {
      const transaction = client.transaction()
      batch.forEach(zoo => {
        transaction.create(zoo)
      })
      
      await transaction.commit()
      results.created += batch.length
      log.info(`Successfully created ${batch.length} petting zoo documents`)
      
    } catch (error) {
      log.error(`Failed to create batch starting at index ${i}:`, error.message)
      results.errors.push({
        batchStart: i,
        batchSize: batch.length,
        error: error.message
      })
    }
  }
  
  return results
}/**

 * Main migration function
 */
async function migratePropertiesToZoos() {
  try {
    log.info('Starting property to petting zoo migration...')
    log.info(`Configuration: ${JSON.stringify(config, null, 2)}`)
    
    // Step 1: Fetch all properties
    const properties = await fetchProperties()
    
    if (properties.length === 0) {
      log.info('No properties found to migrate')
      return
    }
    
    // Step 2: Validate and transform properties
    const validationResults = {
      valid: [],
      invalid: [],
      warnings: []
    }
    
    const transformedZoos = []
    
    properties.forEach((property, index) => {
      log.debug(`Processing property ${index + 1}/${properties.length}: ${property.title}`)
      
      const validation = validateProperty(property)
      
      if (validation.isValid) {
        validationResults.valid.push(property._id)
        const zoo = transformPropertyToZoo(property)
        transformedZoos.push(zoo)
        
        if (validation.warnings.length > 0) {
          validationResults.warnings.push({
            propertyId: property._id,
            propertyTitle: property.title,
            warnings: validation.warnings
          })
        }
      } else {
        validationResults.invalid.push({
          propertyId: property._id,
          propertyTitle: property.title,
          errors: validation.errors
        })
      }
    })
    
    // Step 3: Report validation results
    log.info(`Validation complete:`)
    log.info(`  Valid properties: ${validationResults.valid.length}`)
    log.info(`  Invalid properties: ${validationResults.invalid.length}`)
    log.info(`  Properties with warnings: ${validationResults.warnings.length}`)
    
    if (validationResults.invalid.length > 0) {
      log.warn('Invalid properties found:')
      validationResults.invalid.forEach(item => {
        log.warn(`  ${item.propertyTitle} (${item.propertyId}): ${item.errors.join(', ')}`)
      })
    }
    
    if (validationResults.warnings.length > 0) {
      log.warn('Properties with warnings:')
      validationResults.warnings.forEach(item => {
        log.warn(`  ${item.propertyTitle} (${item.propertyId}): ${item.warnings.join(', ')}`)
      })
    }
    
    // Step 4: Create petting zoo documents
    if (transformedZoos.length > 0) {
      log.info(`Creating ${transformedZoos.length} petting zoo documents...`)
      const results = await createPettingZoos(transformedZoos)
      
      log.info('Migration complete!')
      log.info(`  Successfully created: ${results.created} petting zoos`)
      log.info(`  Errors: ${results.errors.length}`)
      
      if (results.errors.length > 0) {
        log.error('Errors during creation:')
        results.errors.forEach(error => {
          log.error(`  Batch starting at ${error.batchStart}: ${error.error}`)
        })
      }
    } else {
      log.info('No valid properties to migrate')
    }
    
  } catch (error) {
    log.error('Migration failed:', error.message)
    process.exit(1)
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migratePropertiesToZoos()
    .then(() => {
      log.info('Migration script completed')
      process.exit(0)
    })
    .catch((error) => {
      log.error('Migration script failed:', error.message)
      process.exit(1)
    })
}

export { migratePropertiesToZoos, transformPropertyToZoo, validateProperty }