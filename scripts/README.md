# Data Migration Scripts

This directory contains scripts for migrating data from the property schema to the petting zoo schema.

## Prerequisites

1. Install dependencies:
   ```bash
   cd scripts
   npm install
   ```

2. Ensure you have the required environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_write_token
   ```

## Scripts

### migrate-properties-to-zoos.js

Main migration script that transforms property documents to petting zoo format.

**Usage:**
```bash
# Dry run (preview changes without making them)
node migrate-properties-to-zoos.js --dry-run

# Run migration with default batch size (10)
node migrate-properties-to-zoos.js

# Run migration with custom batch size
node migrate-properties-to-zoos.js --batch-size=5
```

**Field Mappings:**
- `title` → `name`
- `propertyType` → `zooType`
- `pricePerNight` → `admissionPrice` (with adult/child/senior pricing)
- `beds` → `animalCount`
- `bedrooms` → `animalTypes`
- `host` → `owner`

**Features:**
- Validates data before migration
- Handles missing fields with defaults
- Processes in batches to avoid API limits
- Comprehensive error handling and logging
- Dry run mode for safe testing

### rollback-migration.js

Rollback script to remove migrated petting zoo documents.

**Usage:**
```bash
# Preview what would be deleted
node rollback-migration.js --dry-run

# Confirm deletion of migrated documents
node rollback-migration.js --confirm
```

**Safety Features:**
- Requires explicit confirmation
- Only deletes documents with migration ID pattern
- Dry run mode for preview
- Batch processing for large datasets

### migrate-images.js

Image migration script that uploads local images to Sanity and creates proper references.

**Usage:**
```bash
# Preview image migration
node migrate-images.js --dry-run

# Run image migration
node migrate-images.js

# Run with optimization (requires sharp package)
node migrate-images.js --optimize
```

**Features:**
- Automatically categorizes images by filename patterns
- Extracts zoo names from image filenames
- Uploads images to Sanity with proper metadata
- Creates image references for petting zoo documents
- Handles main images and additional image galleries
- Validates image files before processing

### optimize-images.js

Image optimization script for web performance (requires sharp package).

**Usage:**
```bash
# Preview optimization
node optimize-images.js --dry-run

# Optimize images with default quality (80%)
node optimize-images.js

# Optimize with custom quality
node optimize-images.js --quality=90
```

**Features:**
- Resizes images to optimal web dimensions
- Converts to modern formats (WebP)
- Creates thumbnails for faster loading
- Compresses images while maintaining quality
- Reports file size savings

### validation-utils.js

Utility functions for data validation used by migration scripts.

**Functions:**
- `isValidUrl()` - URL validation
- `isValidPhoneNumber()` - Phone number validation
- `isValidGeopoint()` - Geographic coordinate validation
- `isValidImage()` - Sanity image object validation
- `isValidSlug()` - URL slug validation
- `sanitizeSlug()` - Convert text to valid slug
- `validatePettingZoo()` - Comprehensive zoo document validation

## Migration Process

1. **Preparation:**
   - Backup your Sanity dataset
   - Test migration on a development dataset first
   - Review field mappings and defaults

2. **Dry Run:**
   ```bash
   node migrate-properties-to-zoos.js --dry-run
   ```

3. **Execute Data Migration:**
   ```bash
   node migrate-properties-to-zoos.js
   ```

4. **Migrate Images:**
   ```bash
   # Preview image migration
   node migrate-images.js --dry-run
   
   # Execute image migration
   node migrate-images.js
   ```

5. **Optimize Images (Optional):**
   ```bash
   # Install sharp for image optimization
   npm install sharp
   
   # Optimize images
   node optimize-images.js
   ```

6. **Verify Results:**
   - Check Sanity Studio for new petting zoo documents
   - Verify data integrity and completeness
   - Test frontend functionality
   - Confirm images are properly linked

7. **Rollback (if needed):**
   ```bash
   node rollback-migration.js --confirm
   ```

## Error Handling

The migration scripts include comprehensive error handling:

- **Validation Errors:** Invalid or missing required fields
- **API Errors:** Network issues or Sanity API problems
- **Batch Errors:** Partial failures in batch processing
- **Data Integrity:** Checks for duplicate or malformed data

All errors are logged with detailed information for troubleshooting.

## Logging

Scripts use structured logging with different levels:
- **INFO:** General progress and results
- **WARN:** Non-critical issues (missing optional fields)
- **ERROR:** Critical failures that stop processing
- **DEBUG:** Detailed processing information (use `--debug` flag)

## Best Practices

1. Always run dry-run first
2. Test on development dataset before production
3. Monitor API rate limits during migration
4. Keep backups of original data
5. Verify results after migration
6. Document any custom field mappings or transformations