import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SafeImage from '../SafeImage'

// Mock the sanity urlFor function
jest.mock('../../sanity', () => ({
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    auto: jest.fn().mockReturnThis(),
    url: jest.fn(() => 'https://example.com/test-image.jpg')
  }))
}))

// Mock validation utility
jest.mock('../../utils/validation', () => ({
  validateImageData: jest.fn()
}))

const { validateImageData } = require('../../utils/validation')

describe('SafeImage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders fallback when image data is invalid', () => {
    validateImageData.mockReturnValue({
      isValid: false,
      data: null,
      errors: ['Image data is null or invalid'],
      warnings: []
    })

    render(<SafeImage image={null} />)
    
    expect(screen.getByText('No image available')).toBeInTheDocument()
    expect(screen.getByText('📷')).toBeInTheDocument()
  })

  it('renders image when data is valid', async () => {
    const mockImage = {
      asset: { _ref: 'image-123' },
      alt: 'Test image'
    }

    validateImageData.mockReturnValue({
      isValid: true,
      data: mockImage,
      errors: [],
      warnings: []
    })

    render(<SafeImage image={mockImage} />)
    
    // Should show loading initially
    expect(screen.getByText('Loading...')).toBeInTheDocument()
    
    // Find and trigger load event on image
    const img = document.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img.src).toBe('https://example.com/test-image.jpg')
    
    // Simulate image load
    fireEvent.load(img)
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
    })
  })

  it('renders fallback when image fails to load', async () => {
    const mockImage = {
      asset: { _ref: 'image-123' },
      alt: 'Test image'
    }

    validateImageData.mockReturnValue({
      isValid: true,
      data: mockImage,
      errors: [],
      warnings: []
    })

    render(<SafeImage image={mockImage} />)
    
    const img = document.querySelector('img')
    
    // Simulate image error
    fireEvent.error(img)
    
    await waitFor(() => {
      expect(screen.getByText('No image available')).toBeInTheDocument()
    })
  })

  it('uses custom fallback text and icon', () => {
    validateImageData.mockReturnValue({
      isValid: false,
      data: null,
      errors: ['Invalid image'],
      warnings: []
    })

    render(
      <SafeImage 
        image={null} 
        fallbackText="Custom fallback" 
        fallbackIcon="🖼️" 
      />
    )
    
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.getByText('🖼️')).toBeInTheDocument()
  })

  it('calls onError callback when image fails', async () => {
    const mockImage = {
      asset: { _ref: 'image-123' },
      alt: 'Test image'
    }
    const onError = jest.fn()

    validateImageData.mockReturnValue({
      isValid: true,
      data: mockImage,
      errors: [],
      warnings: []
    })

    render(<SafeImage image={mockImage} onError={onError} />)
    
    const img = document.querySelector('img')
    
    fireEvent.error(img)
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          isValid: true,
          data: mockImage
        })
      )
    })
  })

  it('applies custom className and style', () => {
    validateImageData.mockReturnValue({
      isValid: false,
      data: null,
      errors: ['Invalid image'],
      warnings: []
    })

    render(
      <SafeImage 
        image={null} 
        className="custom-class"
        style={{ border: '1px solid red' }}
      />
    )
    
    const fallback = document.querySelector('.image-fallback')
    expect(fallback).toHaveClass('image', 'custom-class')
    expect(fallback).toHaveStyle('border: 1px solid red')
  })

  it('handles main-image identifier correctly', () => {
    validateImageData.mockReturnValue({
      isValid: false,
      data: null,
      errors: ['Invalid image'],
      warnings: []
    })

    render(<SafeImage image={null} identifier="main-image" />)
    
    const fallback = document.querySelector('.image-fallback')
    expect(fallback).toHaveClass('main-image')
  })
})