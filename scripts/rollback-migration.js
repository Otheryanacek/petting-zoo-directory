#!/usr/bin/env node

/**
 * Rollback Script: Remove migrated petting zoo documents
 * 
 * This script removes petting zoo documents that were created during migration.
 * It identifies migrated documents by their ID pattern and provides safe rollback.
 * 
 * Usage: node scripts/rollback-migration.js [--dry-run] [--confirm]
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
  token: process.env.SANITY_API_TOKEN,
})

// Configuration
const config = {
  dryRun: process.argv.includes('--dry-run'),
  confirm: process.argv.includes('--confirm'),
  batchSize: 10
}

// Logging utility
const log = {
  info: (msg, data) => console.log(`[INFO] ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`[WARN] ${msg}`, data || ''),
  error: (msg, data) => console.error(`[ERROR] ${msg}`, data || '')
}

/**
 * Fetches all migrated petting zoo documents
 */
async function fetchMigratedZoos() {
  try {
    log.info('Fetching migrated petting zoo documents...')
    
    // Find petting zoos with IDs that match the migration pattern
    const zoos = await client.fetch(`
      *[_type == "pettingZoo" && _id match "pettingZoo-*"] {
        _id,
        _rev,
        name
      }
    `)
    
    log.info(`Found ${zoos.length} migrated petting zoo documents`)
    return zoos
  } catch (error) {
    log.error('Failed to fetch migrated zoos:', error.message)
    throw error
  }
}

/**
 * Deletes petting zoo documents in batches
 */
async function deletePettingZoos(zoos) {
  if (config.dryRun) {
    log.info(`[DRY RUN] Would delete ${zoos.length} petting zoo documents`)
    zoos.forEach(zoo => {
      log.info(`  Would delete: ${zoo.name} (${zoo._id})`)
    })
    return { deleted: zoos.length, errors: [] }
  }
  
  const results = { deleted: 0, errors: [] }
  
  // Process in batches
  for (let i = 0; i < zoos.length; i += config.batchSize) {
    const batch = zoos.slice(i, i + config.batchSize)
    log.info(`Processing batch ${Math.floor(i / config.batchSize) + 1}/${Math.ceil(zoos.length / config.batchSize)}`)
    
    try {
      const transaction = client.transaction()
      batch.forEach(zoo => {
        transaction.delete(zoo._id)
      })
      
      await transaction.commit()
      results.deleted += batch.length
      log.info(`Successfully deleted ${batch.length} petting zoo documents`)
      
    } catch (error) {
      log.error(`Failed to delete batch starting at index ${i}:`, error.message)
      results.errors.push({
        batchStart: i,
        batchSize: batch.length,
        error: error.message
      })
    }
  }
  
  return results
}

/**
 * Main rollback function
 */
async function rollbackMigration() {
  try {
    log.info('Starting migration rollback...')
    
    if (!config.confirm && !config.dryRun) {
      log.error('This operation will permanently delete migrated petting zoo documents.')
      log.error('Use --confirm to proceed or --dry-run to preview changes.')
      process.exit(1)
    }
    
    // Step 1: Fetch migrated documents
    const zoos = await fetchMigratedZoos()
    
    if (zoos.length === 0) {
      log.info('No migrated petting zoo documents found to rollback')
      return
    }
    
    // Step 2: Delete documents
    log.info(`Deleting ${zoos.length} migrated petting zoo documents...`)
    const results = await deletePettingZoos(zoos)
    
    log.info('Rollback complete!')
    log.info(`  Successfully deleted: ${results.deleted} petting zoos`)
    log.info(`  Errors: ${results.errors.length}`)
    
    if (results.errors.length > 0) {
      log.error('Errors during deletion:')
      results.errors.forEach(error => {
        log.error(`  Batch starting at ${error.batchStart}: ${error.error}`)
      })
    }
    
  } catch (error) {
    log.error('Rollback failed:', error.message)
    process.exit(1)
  }
}

// Run rollback if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  rollbackMigration()
    .then(() => {
      log.info('Rollback script completed')
      process.exit(0)
    })
    .catch((error) => {
      log.error('Rollback script failed:', error.message)
      process.exit(1)
    })
}

export { rollbackMigration }