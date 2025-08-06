import { render, screen } from '@testing-library/react'
import PettingZooCard from '../PettingZooCard'

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

describe('PettingZooCard', () => {
  const mockZoo = {
    _id: 'zoo-1',
    slug: { current: 'test-zoo' },
    name: 'Test Petting Zoo',
    mainImage: { asset: { _ref: 'image-ref' } },
    reviews: [{ _id: 'review-1' }, { _id: 'review-2' }],
    admissionPrice: { adult: 15, child: 10, senior: 12 },
    itemType: 'pettingZoo',
    zooType: 'Farm Petting Zoo',
    animalCount: 25,
    animalTypes: 8
  }

  it('renders zoo information correctly', () => {
    render(<PettingZooCard zoo={mockZoo} />)
    
    expect(screen.getByText('Test Petting Zoo')).toBeInTheDocument()
    expect(screen.getByText('Farm Petting Zoo')).toBeInTheDocument()
    expect(screen.getByText('8 animal types • 25 animals')).toBeInTheDocument()
    expect(screen.getByText('2 reviews')).toBeInTheDocument()
    expect(screen.getByText('£15')).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalZoo = {
      _id: 'zoo-2',
      slug: { current: 'minimal-zoo' },
      name: 'Minimal Zoo',
      itemType: 'pettingZoo',
      reviews: []
    }

    render(<PettingZooCard zoo={minimalZoo} />)
    
    expect(screen.getByText('Minimal Zoo')).toBeInTheDocument()
    expect(screen.getByText('0 reviews')).toBeInTheDocument()
    expect(screen.getByText('Contact for pricing')).toBeInTheDocument()
    expect(screen.getByText('No Image Available')).toBeInTheDocument()
  })

  it('creates correct link path for petting zoo', () => {
    render(<PettingZooCard zoo={mockZoo} />)
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/zoo/test-zoo')
  })

  it('handles property data structure for backward compatibility', () => {
    const propertyAsZoo = {
      _id: 'prop-1',
      slug: { current: 'property-zoo' },
      title: 'Property Zoo', // Using title instead of name
      pricePerNight: 20, // Using pricePerNight instead of admissionPrice
      itemType: 'property',
      reviews: [{ _id: 'review-1' }]
    }

    render(<PettingZooCard zoo={propertyAsZoo} />)
    
    expect(screen.getByText('Property Zoo')).toBeInTheDocument()
    expect(screen.getByText('£20')).toBeInTheDocument()
    expect(screen.getByText('1 review')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<PettingZooCard zoo={mockZoo} />)
    
    const card = screen.getByTestId('petting-zoo-card')
    expect(card).toHaveClass('card', 'petting-zoo-card')
  })
})