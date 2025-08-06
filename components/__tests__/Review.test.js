import { render, screen } from '@testing-library/react'
import Review from '../Review'

// Mock sanity urlFor function
jest.mock('../../sanity', () => ({
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    auto: jest.fn().mockReturnValue('mocked-image-url')
  }))
}))

describe('Review', () => {
  const mockReview = {
    rating: 4.5,
    comment: 'Great experience with the animals!',
    visitDate: '2024-01-15',
    traveller: {
      name: 'John Doe',
      image: { asset: { _ref: 'image-ref' } }
    },
    isApproved: true,
    createdAt: '2024-01-20'
  }

  it('renders review information correctly', () => {
    render(<Review review={mockReview} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Great experience with the animals!')).toBeInTheDocument()
    expect(screen.getByText('Visited on January 15, 2024')).toBeInTheDocument()
    expect(screen.getByText('(4.5/5)')).toBeInTheDocument()
  })

  it('renders star rating correctly', () => {
    render(<Review review={mockReview} />)
    
    const stars = screen.container.querySelectorAll('.star')
    expect(stars).toHaveLength(5)
    
    // Check for filled stars (4 full stars)
    const filledStars = screen.container.querySelectorAll('.star.filled')
    expect(filledStars).toHaveLength(4)
    
    // Check for half star
    const halfStars = screen.container.querySelectorAll('.star.half')
    expect(halfStars).toHaveLength(1)
  })

  it('handles missing optional data gracefully', () => {
    const minimalReview = {
      rating: 3,
      traveller: {
        name: 'Jane Smith'
      }
    }

    render(<Review review={minimalReview} />)
    
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('(3/5)')).toBeInTheDocument()
    expect(screen.getByText('Recently posted')).toBeInTheDocument()
  })

  it('shows moderation information when showModeration is true', () => {
    const pendingReview = {
      ...mockReview,
      isApproved: false,
      moderationNotes: 'Needs review for content'
    }

    render(<Review review={pendingReview} showModeration={true} />)
    
    expect(screen.getByText('⏳ Pending Review')).toBeInTheDocument()
    expect(screen.getByText('Needs review for content')).toBeInTheDocument()
  })

  it('shows approved status when review is approved', () => {
    render(<Review review={mockReview} showModeration={true} />)
    
    expect(screen.getByText('✓ Approved')).toBeInTheDocument()
  })

  it('applies pending approval class when review is not approved', () => {
    const pendingReview = {
      ...mockReview,
      isApproved: false
    }

    render(<Review review={pendingReview} />)
    
    const card = screen.getByTestId('review-card')
    expect(card).toHaveClass('review-card', 'pending-approval')
  })

  it('handles anonymous reviewer', () => {
    const anonymousReview = {
      rating: 5,
      comment: 'Loved it!',
      traveller: null
    }

    render(<Review review={anonymousReview} />)
    
    expect(screen.getByText('Anonymous')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<Review review={mockReview} />)
    
    const card = screen.getByTestId('review-card')
    expect(card).toHaveClass('review-card')
    expect(card).not.toHaveClass('pending-approval')
  })
})