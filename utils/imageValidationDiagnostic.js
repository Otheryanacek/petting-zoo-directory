/**
 * Diagnostic tool for SafeImage validation failures
 * Helps identify and fix image data issues
 */

import { validateImageData } from './validation'

/**
 * Diagnose image validation issues and provide fix suggestions
 * @param {any} image - The image data that failed validation
 * @param {object} context - Additional context about where the image is used
 * @returns {object} Diagnostic results with fix suggestions
 */
export function diagnoseImageValidation(image, context = {}) {
  const diagnosis = {
    issue: null,
    severity: 'low',
    fixes: [],
    examples: [],
    debugInfo: {}
  }

  // Store debug info
  diagnosis.debugInfo = {
    imageType: typeof image,
    imageValue: image,
    isNull: image === null,
    isUndefined: image === undefined,
    isObject: typeof image === 'object' && image !== null,
    hasAsset: image?.asset ? true : false,
    assetType: typeof image?.asset,
    assetValue: image?.asset,
    context
  }

  // Case 1: Image is null or undefined
  if (!image) {
    diagnosis.issue = 'Image data is null or undefined'
    diagnosis.severity = 'medium'
    diagnosis.fixes = [
      'Check if the image field exists in your Sanity schema',
      'Verify the image was uploaded in Sanity Studio',
      'Check your GROQ query includes the image field',
      'Add a conditional check before using SafeImage'
    ]
    diagnosis.examples = [
      '// Add conditional rendering:\n{zoo.mainImage && <SafeImage image={zoo.mainImage} />}',
      '// Or use fallback in query:\n*[_type == "pettingZoo"]{ mainImage, "fallbackImage": coalesce(mainImage, *[_type == "defaultImages"][0].placeholder) }'
    ]
    return diagnosis
  }

  // Case 2: Image is not an object
  if (typeof image !== 'object') {
    diagnosis.issue = 'Image data is not an object'
    diagnosis.severity = 'high'
    diagnosis.fixes = [
      'Check your data structure - image should be an object',
      'Verify your GROQ query is returning the correct format',
      'Check if you\'re passing a string URL instead of an image object'
    ]
    diagnosis.examples = [
      '// Correct format:\n{ asset: { _ref: "image-abc123" }, alt: "Description" }',
      '// Incorrect format:\n"https://example.com/image.jpg" // This is just a string'
    ]
    return diagnosis
  }

  // Case 3: Missing asset reference
  if (!image.asset) {
    diagnosis.issue = 'Image missing asset reference'
    diagnosis.severity = 'high'
    diagnosis.fixes = [
      'Check if the image was properly uploaded in Sanity Studio',
      'Verify your GROQ query includes the asset reference',
      'Check if the image field is properly configured in your schema',
      'Try re-uploading the image in Sanity Studio'
    ]
    diagnosis.examples = [
      '// Correct GROQ query:\n*[_type == "pettingZoo"]{ mainImage { asset, alt, caption } }',
      '// Check in Sanity Studio that the image field shows an uploaded image'
    ]
    return diagnosis
  }

  // Case 4: Asset reference format issues
  if (image.asset && typeof image.asset !== 'object') {
    diagnosis.issue = 'Asset reference has wrong format'
    diagnosis.severity = 'medium'
    diagnosis.fixes = [
      'Asset should be an object with _ref property',
      'Check your GROQ query format',
      'Verify Sanity client configuration'
    ]
    diagnosis.examples = [
      '// Correct asset format:\n{ asset: { _ref: "image-abc123-400x300-jpg" } }',
      '// Query to get proper format:\nmainImage { asset->{ _id, url }, alt }'
    ]
    return diagnosis
  }

  // Case 5: Missing _ref in asset
  if (image.asset && !image.asset._ref && !image.asset._id) {
    diagnosis.issue = 'Asset missing _ref or _id property'
    diagnosis.severity = 'high'
    diagnosis.fixes = [
      'Check your GROQ query includes asset._ref',
      'Verify the image was properly saved in Sanity',
      'Try using asset->{ _id, url } in your query'
    ]
    diagnosis.examples = [
      '// Query with _ref:\nmainImage { asset { _ref }, alt }',
      '// Query with expanded asset:\nmainImage { asset->{ _id, url }, alt }'
    ]
    return diagnosis
  }

  // If we get here, run the actual validation to see what failed
  const validationResult = validateImageData(image)
  
  if (!validationResult.isValid) {
    diagnosis.issue = `Validation failed: ${validationResult.errors.join(', ')}`
    diagnosis.severity = 'medium'
    diagnosis.fixes = [
      'Check the specific validation errors above',
      'Verify image data structure matches expected format',
      'Check Sanity Studio for any data corruption'
    ]
    diagnosis.examples = [
      '// Expected image structure:\n{\n  asset: { _ref: "image-abc123" },\n  alt: "Description",\n  caption: "Optional caption",\n  hotspot: null,\n  crop: null\n}'
    ]
    diagnosis.debugInfo.validationErrors = validationResult.errors
    diagnosis.debugInfo.validationWarnings = validationResult.warnings
  } else {
    diagnosis.issue = 'Image appears valid - this might be a false positive'
    diagnosis.severity = 'low'
    diagnosis.fixes = [
      'Check if the error is occurring during image loading rather than validation',
      'Verify the Sanity urlFor() function is working correctly',
      'Check network connectivity to Sanity CDN'
    ]
  }

  return diagnosis
}

/**
 * Create a detailed report for multiple image validation failures
 * @param {Array} failures - Array of { image, context } objects that failed
 * @returns {object} Comprehensive report with patterns and recommendations
 */
export function createImageValidationReport(failures) {
  const report = {
    totalFailures: failures.length,
    issuePatterns: {},
    severityBreakdown: { high: 0, medium: 0, low: 0 },
    commonFixes: [],
    recommendations: []
  }

  // Analyze each failure
  failures.forEach(({ image, context }) => {
    const diagnosis = diagnoseImageValidation(image, context)
    
    // Count issue patterns
    if (!report.issuePatterns[diagnosis.issue]) {
      report.issuePatterns[diagnosis.issue] = {
        count: 0,
        severity: diagnosis.severity,
        fixes: diagnosis.fixes,
        examples: diagnosis.examples
      }
    }
    report.issuePatterns[diagnosis.issue].count++
    
    // Count severity
    report.severityBreakdown[diagnosis.severity]++
  })

  // Generate common fixes
  const allFixes = Object.values(report.issuePatterns)
    .flatMap(pattern => pattern.fixes)
  
  const fixCounts = {}
  allFixes.forEach(fix => {
    fixCounts[fix] = (fixCounts[fix] || 0) + 1
  })
  
  report.commonFixes = Object.entries(fixCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([fix, count]) => ({ fix, count }))

  // Generate recommendations
  if (report.severityBreakdown.high > 0) {
    report.recommendations.push('🚨 High priority: Fix missing asset references - these prevent images from loading entirely')
  }
  
  if (report.issuePatterns['Image data is null or undefined']?.count > 0) {
    report.recommendations.push('💡 Consider adding default images or better conditional rendering')
  }
  
  if (report.totalFailures > 10) {
    report.recommendations.push('📊 High failure rate suggests a systematic issue - check your GROQ queries and Sanity schema')
  }

  return report
}

/**
 * Console helper to debug image validation issues
 * @param {any} image - Image to debug
 * @param {string} componentName - Name of component using the image
 */
export function debugImageValidation(image, componentName = 'Unknown') {
  console.group(`🖼️ Image Validation Debug: ${componentName}`)
  
  const diagnosis = diagnoseImageValidation(image, { componentName })
  
  console.log('Issue:', diagnosis.issue)
  console.log('Severity:', diagnosis.severity)
  console.log('Debug Info:', diagnosis.debugInfo)
  
  if (diagnosis.fixes.length > 0) {
    console.log('Suggested Fixes:')
    diagnosis.fixes.forEach((fix, index) => {
      console.log(`  ${index + 1}. ${fix}`)
    })
  }
  
  if (diagnosis.examples.length > 0) {
    console.log('Examples:')
    diagnosis.examples.forEach(example => {
      console.log(example)
    })
  }
  
  console.groupEnd()
  
  return diagnosis
}