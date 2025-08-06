import { render, screen, fireEvent } from '@testing-library/react'
import ReviewSection from '../ReviewSection'

// Mock Review component
jest.mock('../Review', () => {
  return function MockReview({ review, showModeration }) {
    return (
      <div data-testid="mock-review" className={showModeration ? 'with-moderation' : ''}>
        {review.traveller?.name} - {review.rating} stars - {review.comment}
      </div>
    )
  }
})

describe('ReviewSection', () => {
  const mockReviews = [
    {
      _id: '1',
      rating: 5,
      comment: 'Amazing experience!',
      visitDate: '2024-01-15',
      traveller: { name: 'John Doe' },
      isApproved: true,
      createdAt: '2024-01-20'
    },
    {
      _id: '2',
      rating: 4,
      comment: 'Great place for kids',
      visitDate: '2024-01-10',
      traveller: { name: 'Jane Smith' },
      isApproved: true,
      createdAt: '2024-01-18'
    },
    {
      _id: '3',
      rating: 3,
      comment: 'Good but crowded',
      visitDate: '2024-01-05',
      traveller: { name: 'Bob Wilson' },
      isApproved: false,
      createdAt: '2024-01-16'
    }
  ]

  it('renders review section with title and summary', () => {
    render(<ReviewSection reviews={mockReviews} title="Zoo Reviews" />)
    
    expect(screen.getByText('Zoo Reviews')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument() // Average rating
    expect(screen.getByText('out of 5')).toBeInTheDocument()
    expect(screen.getByText('2 reviews')).toBeInTheDocument() // Only approved reviews
  })

  it('shows only approved reviews by default', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    expect(screen.getByText('John Doe - 5 stars - Amazing experience!')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith - 4 stars - Great place for kids')).toBeInTheDocument()
    expect(screen.queryByText('Bob Wilson - 3 stars - Good but crowded')).not.toBeInTheDocument()
  })

  it('shows all reviews when showModeration is true', () => {
    render(<ReviewSection reviews={mockReviews} showModeration={true} />)
    
    expect(screen.getByText('John Doe - 5 stars - Amazing experience!')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith - 4 stars - Great place for kids')).toBeInTheDocument()
    expect(screen.getByText('Bob Wilson - 3 stars - Good but crowded')).toBeInTheDocument()
    expect(screen.getByText('3 reviews')).toBeInTheDocument()
  })

  it('sorts reviews by newest first by default', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    const reviews = screen.getAllByTestId('mock-review')
    expect(reviews[0]).toHaveTextContent('John Doe') // Most recent
    expect(reviews[1]).toHaveTextContent('Jane Smith') // Second most recent
  })

  it('sorts reviews by rating when selected', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    const sortSelect = screen.getByDisplayValue('Newest First')
    fireEvent.change(sortSelect, { target: { value: 'highest' } })
    
    const reviews = screen.getAllByTestId('mock-review')
    expect(reviews[0]).toHaveTextContent('John Doe') // 5 stars
    expect(reviews[1]).toHaveTextContent('Jane Smith') // 4 stars
  })

  it('filters reviews by rating', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    const filterSelect = screen.getByDisplayValue('All Ratings')
    fireEvent.change(filterSelect, { target: { value: '5' } })
    
    expect(screen.getByText('John Doe - 5 stars - Amazing experience!')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith - 4 stars - Great place for kids')).not.toBeInTheDocument()
    expect(screen.getByText('1 review')).toBeInTheDocument()
  })

  it('shows rating breakdown correctly', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    expect(screen.getByText('5 ★')).toBeInTheDocument()
    expect(screen.getByText('4 ★')).toBeInTheDocument()
    expect(screen.getByText('3 ★')).toBeInTheDocument()
    expect(screen.getByText('2 ★')).toBeInTheDocument()
    expect(screen.getByText('1 ★')).toBeInTheDocument()
  })

  it('handles empty reviews array', () => {
    render(<ReviewSection reviews={[]} />)
    
    expect(screen.getByText('No reviews yet. Be the first to share your experience!')).toBeInTheDocument()
  })

  it('shows no results message when filters match no reviews', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    const filterSelect = screen.getByDisplayValue('All Ratings')
    fireEvent.change(filterSelect, { target: { value: '1' } })
    
    expect(screen.getByText('No reviews match the selected filters.')).toBeInTheDocument()
    expect(screen.getByText('Reset Filters')).toBeInTheDocument()
  })

  it('resets filters when reset button is clicked', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    // Apply filters
    const filterSelect = screen.getByDisplayValue('All Ratings')
    fireEvent.change(filterSelect, { target: { value: '5' } })
    
    // Click reset
    const resetButton = screen.getByText('Reset Filters')
    fireEvent.click(resetButton)
    
    // Check that all reviews are shown again
    expect(screen.getByText('2 reviews')).toBeInTheDocument()
  })

  it('uses default title when none provided', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    expect(screen.getByText('Visitor Reviews')).toBeInTheDocument()
  })

  it('hides sorting controls when allowSorting is false', () => {
    render(<ReviewSection reviews={mockReviews} allowSorting={false} />)
    
    expect(screen.queryByText('Sort by:')).not.toBeInTheDocument()
    expect(screen.queryByText('Filter by rating:')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<ReviewSection reviews={mockReviews} />)
    
    const section = screen.getByTestId('review-section')
    expect(section).toHaveClass('review-section')
  })
})