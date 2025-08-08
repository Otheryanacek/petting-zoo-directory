import { render, screen } from '@testing-library/react'
import PropertyCard from '../PropertyCard'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }) => {
    return <a href={href}>{children}</a>
  }
})

// Mock sanity urlFor function
jest.mock('../../sanity', () => ({
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    auto: jest.fn().mockReturnValue('mocked-image-url')
  }))
}))

// Mock utils
jest.mock('../../utils', () => ({
  isMultiple: jest.fn((count) => count !== 1 ? 's' : '')
}))

describe('PropertyCard', () => {
  const mockProperty = {
    _id: 'prop-1',
    slug: { current: 'test-property' },
    title: 'Test Property Zoo',
    mainImage: { asset: { _ref: 'image-ref' } },
    reviews: [{ _id: 'review-1' }],
    pricePerNight: 25,
    propertyType: 'Educational Zoo',
    beds: 30,
    bedrooms: 10
  }

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('Test Property Zoo')).toBeInTheDocument()
    expect(screen.getByText('Educational Zoo')).toBeInTheDocument()
    expect(screen.getByText('10 animal types • 30 animals')).toBeInTheDocument()
    expect(screen.getByText('1 review')).toBeInTheDocument()
    expect(screen.getByText('£25')).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalProperty = {
      _id: 'prop-2',
      slug: { current: 'minimal-property' },
      title: 'Minimal Property',
      reviews: []
    }

    render(<PropertyCard property={minimalProperty} />)
    
    expect(screen.getByText('Minimal Property')).toBeInTheDocument()
    expect(screen.getByText('0 reviews')).toBeInTheDocument()
    expect(screen.getByText('Contact for pricing')).toBeInTheDocument()
    expect(screen.getByText('No Image Available')).toBeInTheDocument()
  })

  it('creates correct link path for property', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/zoo/test-property')
  })

  it('handles singular vs plural correctly', () => {
    const singleProperty = {
      ...mockProperty,
      beds: 1,
      bedrooms: 1,
      reviews: [{ _id: 'review-1' }]
    }

    render(<PropertyCard property={singleProperty} />)
    
    expect(screen.getByText('1 animal type • 1 animal')).toBeInTheDocument()
    expect(screen.getByText('1 review')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<PropertyCard property={mockProperty} />)
    
    const card = screen.getByTestId('property-card')
    expect(card).toHaveClass('card', 'property-card')
  })
})