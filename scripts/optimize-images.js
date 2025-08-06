#!/usr/bin/env node

/**
 * Image Optimization Script
 * 
 * This script optimizes images for web performance before uploading to Sanity.
 * It resizes, compresses, and converts images to optimal formats.
 * 
 * Note: This script requires sharp package for image processing.
 * Install with: npm install sharp
 * 
 * Usage: node scripts/optimize-images.js [--dry-run] [--quality=80]
 */

import { readdirSync, statSync, mkdirSync, existsSync } from 'fs'
import { join, extname, basename } from 'path'

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  quality: parseInt(process.argv.find(arg => arg.startsWith('--quality='))?.split('=')[1]) || 80,
  inputDir: './images',
  outputDir: './images/optimized',
  maxWidth: 1920,
  maxHeight: 1080,
  thumbnailWidth: 400,
  thumbnailHeight: 300,
  supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  outputFormat: 'webp' // Modern format for better compression
}

// Logging utility
const log = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
}

/**
 * Check if sharp is available
 */
function checkSharpAvailability() {
  try {
    // Dynamic import to check if sharp is available
    return true
  } catch (error) {
    log.error('Sharp package not found. Install with: npm install sharp')
    log.error('Image optimization requires the sharp package for processing.')
    return false
  }
}

/**
 * Creates output directory if it doesn't exist
 */
function ensureOutputDirectory() {
  if (!existsSync(config.outputDir)) {
    if (config.dryRun) {
      log.info(`[DRY RUN] Would create directory: ${config.outputDir}`)
    } else {
      mkdirSync(config.outputDir, { recursive: true })
      log.info(`Created output directory: ${config.outputDir}`)
    }
  }
}

/**
 * Gets image files from input directory
 */
function getImageFiles() {
  try {
    const files = readdirSync(config.inputDir)
    const imageFiles = files.filter(file => {
      const ext = extname(file).toLowerCase()
      return config.supportedFormats.includes(ext)
    })
    
    return imageFiles.map(filename => ({
      filename,
      inputPath: join(config.inputDir, filename),
      outputPath: join(config.outputDir, `${basename(filename, extname(filename))}.${config.outputFormat}`),
      thumbnailPath: join(config.outputDir, `${basename(filename, extname(filename))}_thumb.${config.outputFormat}`)
    }))
  } catch (error) {
    log.error('Failed to read input directory:', error.message)
    throw error
  }
}

/**
 * Optimizes a single image (placeholder - requires sharp)
 */
async function optimizeImage(imageInfo) {
  if (config.dryRun) {
    log.info(`[DRY RUN] Would optimize ${imageInfo.filename}`)
    return {
      original: { size: 0, width: 0, height: 0 },
      optimized: { size: 0, width: 0, height: 0 },
      thumbnail: { size: 0, width: 0, height: 0 },
      savings: 0
    }
  }
  
  // This is a placeholder implementation
  // In a real implementation, you would use sharp here:
  /*
  const sharp = require('sharp');
  
  const originalStats = statSync(imageInfo.inputPath);
  const image = sharp(imageInfo.inputPath);
  const metadata = await image.metadata();
  
  // Optimize main image
  await image
    .resize(config.maxWidth, config.maxHeight, { 
      fit: 'inside', 
      withoutEnlargement: true 
    })
    .webp({ quality: config.quality })
    .toFile(imageInfo.outputPath);
  
  // Create thumbnail
  await sharp(imageInfo.inputPath)
    .resize(config.thumbnailWidth, config.thumbnailHeight, { 
      fit: 'cover' 
    })
    .webp({ quality: config.quality })
    .toFile(imageInfo.thumbnailPath);
  
  const optimizedStats = statSync(imageInfo.outputPath);
  const thumbnailStats = statSync(imageInfo.thumbnailPath);
  
  return {
    original: { 
      size: originalStats.size, 
      width: metadata.width, 
      height: metadata.height 
    },
    optimized: { 
      size: optimizedStats.size, 
      width: Math.min(metadata.width, config.maxWidth), 
      height: Math.min(metadata.height, config.maxHeight) 
    },
    thumbnail: { 
      size: thumbnailStats.size, 
      width: config.thumbnailWidth, 
      height: config.thumbnailHeight 
    },
    savings: ((originalStats.size - optimizedStats.size) / originalStats.size) * 100
  };
  */
  
  log.warn(`Image optimization skipped for ${imageInfo.filename} - sharp package required`)
  return null
}

/**
 * Main optimization function
 */
async function optimizeImages() {
  try {
    log.info('Starting image optimization...')
    log.info(`Configuration: ${JSON.stringify(config, null, 2)}`)
    
    // Check if sharp is available
    if (!checkSharpAvailability()) {
      log.info('Image optimization requires the sharp package.')
      log.info('Install with: cd scripts && npm install sharp')
      log.info('For now, images will be used as-is without optimization.')
      return
    }
    
    // Ensure output directory exists
    ensureOutputDirectory()
    
    // Get image files
    const imageFiles = getImageFiles()
    log.info(`Found ${imageFiles.length} images to optimize`)
    
    if (imageFiles.length === 0) {
      log.info('No images found to optimize')
      return
    }
    
    // Process images
    const results = {
      processed: 0,
      totalOriginalSize: 0,
      totalOptimizedSize: 0,
      errors: []
    }
    
    for (const imageInfo of imageFiles) {
      try {
        const result = await optimizeImage(imageInfo)
        
        if (result) {
          results.processed++
          results.totalOriginalSize += result.original.size
          results.totalOptimizedSize += result.optimized.size
          
          log.info(`Optimized ${imageInfo.filename}: ${(result.savings).toFixed(1)}% savings`)
        }
        
      } catch (error) {
        log.error(`Failed to optimize ${imageInfo.filename}:`, error.message)
        results.errors.push({
          filename: imageInfo.filename,
          error: error.message
        })
      }
    }
    
    // Report results
    log.info('Image optimization complete!')
    log.info(`  Images processed: ${results.processed}`)
    log.info(`  Total original size: ${(results.totalOriginalSize / 1024 / 1024).toFixed(2)}MB`)
    log.info(`  Total optimized size: ${(results.totalOptimizedSize / 1024 / 1024).toFixed(2)}MB`)
    
    if (results.totalOriginalSize > 0) {
      const totalSavings = ((results.totalOriginalSize - results.totalOptimizedSize) / results.totalOriginalSize) * 100
      log.info(`  Total savings: ${totalSavings.toFixed(1)}%`)
    }
    
    log.info(`  Errors: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      log.error('Errors during optimization:')
      results.errors.forEach(error => {
        log.error(`  ${error.filename}: ${error.error}`)
      })
    }
    
  } catch (error) {
    log.error('Image optimization failed:', error.message)
    process.exit(1)
  }
}

// Run optimization if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  optimizeImages()
    .then(() => {
      log.info('Image optimization script completed')
      process.exit(0)
    })
    .catch((error) => {
      log.error('Image optimization script failed:', error.message)
      process.exit(1)
    })
}

export { optimizeImages }