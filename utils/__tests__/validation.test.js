/**
 * Unit tests for validation utilities
 * Tests all edge cases and data validation scenarios
 */

import {
  validateZooData,
  validateImageData,
  validateLocationData,
  validateSlugData,
  sanitizeArrayData,
  validateAndSanitizeData
} from '../validation.js';

describe('validateZooData', () => {
  test('should handle null/undefined zoo data', () => {
    const result1 = validateZooData(null);
    expect(result1.isValid).toBe(false);
    expect(result1.errors).toContain('Zoo data is null or not an object');
    expect(result1.data.name).toBe('Unnamed Petting Zoo');

    const result2 = validateZooData(undefined);
    expect(result2.isValid).toBe(false);
    expect(result2.data._id).toMatch(/^fallback-/);
  });

  test('should handle empty object', () => {
    const result = validateZooData({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Zoo missing valid slug');
    expect(result.warnings).toContain('Zoo missing _id, using temporary ID');
    expect(result.warnings).toContain('Zoo missing name, using default');
  });

  test('should validate complete zoo data', () => {
    const validZoo = {
      _id: 'zoo-123',
      name: 'Happy Farm Zoo',
      slug: { current: 'happy-farm-zoo' },
      description: 'A wonderful petting zoo',
      location: { lat: 40.7128, lng: -74.0060 },
      mainImage: { asset: { _ref: 'image-123' }, alt: 'Zoo entrance' },
      images: [{ asset: { _ref: 'image-456' } }],
      admissionPrice: { adult: 15, child: 10 },
      reviews: [{ rating: 5 }],
      amenities: ['parking', 'restrooms'],
      animals: ['goats', 'sheep']
    };

    const result = validateZooData(validZoo);
    expect(result.isValid).toBe(true);
    expect(result.data.name).toBe('Happy Farm Zoo');
    expect(result.data.slug.current).toBe('happy-farm-zoo');
    expect(result.errors).toHaveLength(0);
  });

  test('should sanitize arrays and handle missing data', () => {
    const zooWithMissingData = {
      _id: 'zoo-456',
      name: 'Test Zoo',
      slug: { current: 'test-zoo' },
      images: null, // Should become empty array
      reviews: 'not-an-array', // Should become empty array
      amenities: [null, 'parking', undefined, 'restrooms'] // Should filter nulls
    };

    const result = validateZooData(zooWithMissingData);
    expect(result.isValid).toBe(true);
    expect(result.data.images).toEqual([]);
    expect(result.data.reviews).toEqual([]);
    expect(result.data.amenities).toEqual(['parking', 'restrooms']);
  });
});

describe('validateImageData', () => {
  test('should handle null/undefined image data', () => {
    const result1 = validateImageData(null);
    expect(result1.isValid).toBe(false);
    expect(result1.data).toBe(null);
    expect(result1.errors).toContain('Image data is null or invalid');

    const result2 = validateImageData(undefined);
    expect(result2.isValid).toBe(false);
  });

  test('should require asset reference', () => {
    const imageWithoutAsset = { alt: 'Test image' };
    const result = validateImageData(imageWithoutAsset);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Image missing asset reference');
  });

  test('should validate complete image data', () => {
    const validImage = {
      asset: { _ref: 'image-123' },
      alt: 'Zoo entrance',
      caption: 'Welcome to our zoo',
      hotspot: { x: 0.5, y: 0.5 },
      crop: { top: 0, bottom: 0, left: 0, right: 0 }
    };

    const result = validateImageData(validImage);
    expect(result.isValid).toBe(true);
    expect(result.data.alt).toBe('Zoo entrance');
    expect(result.data.asset).toEqual({ _ref: 'image-123' });
    expect(result.errors).toHaveLength(0);
  });

  test('should provide default alt text when missing', () => {
    const imageWithoutAlt = {
      asset: { _ref: 'image-123' }
    };

    const result = validateImageData(imageWithoutAlt);
    expect(result.isValid).toBe(true);
    expect(result.data.alt).toBe('Petting zoo image');
    expect(result.warnings).toContain('Image missing alt text, using default');
  });
});

describe('validateLocationData', () => {
  test('should handle null/undefined location data', () => {
    const result1 = validateLocationData(null);
    expect(result1.isValid).toBe(false);
    expect(result1.data).toBe(null);

    const result2 = validateLocationData(undefined);
    expect(result2.isValid).toBe(false);
  });

  test('should validate latitude and longitude ranges', () => {
    const invalidLat = { lat: 100, lng: -74.0060 }; // lat > 90
    const result1 = validateLocationData(invalidLat);
    expect(result1.isValid).toBe(false);
    expect(result1.errors).toContain('Invalid latitude value');

    const invalidLng = { lat: 40.7128, lng: 200 }; // lng > 180
    const result2 = validateLocationData(invalidLng);
    expect(result2.isValid).toBe(false);
    expect(result2.errors).toContain('Invalid longitude value');

    const invalidBoth = { lat: 'not-a-number', lng: 'also-not-a-number' };
    const result3 = validateLocationData(invalidBoth);
    expect(result3.isValid).toBe(false);
    expect(result3.errors).toContain('Invalid latitude value');
    expect(result3.errors).toContain('Invalid longitude value');
  });

  test('should validate correct location data', () => {
    const validLocation = {
      lat: 40.7128,
      lng: -74.0060,
      address: '123 Zoo Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    };

    const result = validateLocationData(validLocation);
    expect(result.isValid).toBe(true);
    expect(result.data.lat).toBe(40.7128);
    expect(result.data.lng).toBe(-74.0060);
    expect(result.data.city).toBe('New York');
    expect(result.errors).toHaveLength(0);
  });

  test('should handle string coordinates', () => {
    const stringCoords = { lat: '40.7128', lng: '-74.0060' };
    const result = validateLocationData(stringCoords);
    expect(result.isValid).toBe(true);
    expect(result.data.lat).toBe(40.7128);
    expect(result.data.lng).toBe(-74.0060);
  });
});

describe('validateSlugData', () => {
  test('should handle null/undefined slug data', () => {
    const result1 = validateSlugData(null);
    expect(result1.isValid).toBe(false);
    expect(result1.data.current).toBe(null);

    const result2 = validateSlugData(undefined);
    expect(result2.isValid).toBe(false);
  });

  test('should require current property', () => {
    const slugWithoutCurrent = { _type: 'slug' };
    const result = validateSlugData(slugWithoutCurrent);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Slug missing current value');
  });

  test('should validate correct slug format', () => {
    const validSlug = { current: 'happy-farm-zoo' };
    const result = validateSlugData(validSlug);
    expect(result.isValid).toBe(true);
    expect(result.data.current).toBe('happy-farm-zoo');
    expect(result.errors).toHaveLength(0);
  });

  test('should warn about non-URL-safe slugs', () => {
    const unsafeSlug = { current: 'Happy Farm Zoo!' };
    const result = validateSlugData(unsafeSlug);
    expect(result.isValid).toBe(true);
    expect(result.warnings).toContain('Slug format may not be URL-safe');
    expect(result.data.current).toBe('happy farm zoo!'); // Should be lowercased and trimmed
  });

  test('should handle empty string slug', () => {
    const emptySlug = { current: '' };
    const result = validateSlugData(emptySlug);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Slug missing current value');
  });
});

describe('sanitizeArrayData', () => {
  test('should return empty array for non-arrays', () => {
    expect(sanitizeArrayData(null)).toEqual([]);
    expect(sanitizeArrayData(undefined)).toEqual([]);
    expect(sanitizeArrayData('not-an-array')).toEqual([]);
    expect(sanitizeArrayData(123)).toEqual([]);
    expect(sanitizeArrayData({})).toEqual([]);
  });

  test('should filter null/undefined items from arrays', () => {
    const arrayWithNulls = ['item1', null, 'item2', undefined, 'item3'];
    const result = sanitizeArrayData(arrayWithNulls);
    expect(result).toEqual(['item1', 'item2', 'item3']);
  });

  test('should return valid arrays unchanged', () => {
    const validArray = ['item1', 'item2', 'item3'];
    const result = sanitizeArrayData(validArray);
    expect(result).toEqual(validArray);
  });

  test('should handle empty arrays', () => {
    const result = sanitizeArrayData([]);
    expect(result).toEqual([]);
  });
});

describe('validateAndSanitizeData', () => {
  test('should handle null/undefined data', () => {
    const result = validateAndSanitizeData(null);
    expect(result.isValid).toBe(false);
    expect(result.data.pettingZoos).toEqual([]);
    expect(result.errors).toContain('No data received from API');
  });

  test('should handle array of zoos', () => {
    const zooArray = [
      {
        _id: 'zoo-1',
        name: 'Zoo 1',
        slug: { current: 'zoo-1' }
      },
      {
        _id: 'zoo-2',
        name: 'Zoo 2',
        slug: { current: 'zoo-2' }
      }
    ];

    const result = validateAndSanitizeData(zooArray);
    expect(result.isValid).toBe(true);
    expect(result.data.pettingZoos).toHaveLength(2);
    expect(result.data.pettingZoos[0].name).toBe('Zoo 1');
  });

  test('should handle object with pettingZoos property', () => {
    const dataObject = {
      pettingZoos: [
        {
          _id: 'zoo-1',
          name: 'Zoo 1',
          slug: { current: 'zoo-1' }
        }
      ],
      totalCount: 1
    };

    const result = validateAndSanitizeData(dataObject);
    expect(result.isValid).toBe(true);
    expect(result.data.pettingZoos).toHaveLength(1);
    expect(result.data.totalCount).toBe(1);
  });

  test('should handle single zoo object', () => {
    const singleZoo = {
      _id: 'zoo-1',
      name: 'Single Zoo',
      slug: { current: 'single-zoo' }
    };

    const result = validateAndSanitizeData(singleZoo);
    expect(result.isValid).toBe(true);
    expect(result.data.name).toBe('Single Zoo');
  });

  test('should filter out invalid zoos', () => {
    const mixedData = [
      {
        _id: 'zoo-1',
        name: 'Valid Zoo',
        slug: { current: 'valid-zoo' }
      },
      {
        // Invalid zoo - missing slug
        _id: 'zoo-2',
        name: 'Invalid Zoo'
      }
    ];

    const result = validateAndSanitizeData(mixedData);
    expect(result.isValid).toBe(false); // Has errors from invalid zoo
    expect(result.data.pettingZoos).toHaveLength(1); // Only valid zoo included
    expect(result.data.pettingZoos[0].name).toBe('Valid Zoo');
    expect(result.errors.length).toBeGreaterThan(0);
  });
});