import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ShareButton from '../ShareButton'

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

// Mock window.prompt
global.prompt = jest.fn()

describe('ShareButton', () => {
  const mockSearchTerm = 'farm zoo'
  const mockFilters = {
    zooTypes: ['Farm Petting Zoo'],
    animalTypes: [],
    amenities: [],
    distance: 'all',
    priceRange: 'all',
    rating: 'all'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock window.location
    delete window.location
    window.location = {
      origin: 'http://localhost:3000',
      pathname: '/'
    }
  })

  it('renders share button when filters are active', () => {
    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} />)
    
    expect(screen.getByTestId('share-button')).toBeInTheDocument()
    expect(screen.getByText('Share')).toBeInTheDocument()
  })

  it('does not render when no search term or filters are active', () => {
    const emptyFilters = {
      zooTypes: [],
      animalTypes: [],
      amenities: [],
      distance: 'all',
      priceRange: 'all',
      rating: 'all'
    }

    render(<ShareButton searchTerm="" filters={emptyFilters} />)
    
    expect(screen.queryByTestId('share-button')).not.toBeInTheDocument()
  })

  it('copies URL to clipboard when clicked', async () => {
    navigator.clipboard.writeText.mockResolvedValue()

    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} />)
    
    const shareButton = screen.getByTestId('share-button')
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('search=farm%20zoo')
      )
    })
  })

  it('shows tooltip after successful copy', async () => {
    navigator.clipboard.writeText.mockResolvedValue()

    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} />)
    
    const shareButton = screen.getByTestId('share-button')
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(screen.getByTestId('share-tooltip')).toBeInTheDocument()
      expect(screen.getByText('Link copied!')).toBeInTheDocument()
    })
  })

  it('falls back to prompt when clipboard fails', async () => {
    navigator.clipboard.writeText.mockRejectedValue(new Error('Clipboard failed'))

    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} />)
    
    const shareButton = screen.getByTestId('share-button')
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(global.prompt).toHaveBeenCalledWith(
        'Copy this URL to share:',
        expect.stringContaining('search=farm%20zoo')
      )
    })
  })

  it('uses Web Share API when available', async () => {
    const mockShare = jest.fn().mockResolvedValue()
    navigator.share = mockShare

    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} />)
    
    const shareButton = screen.getByTestId('share-button')
    fireEvent.click(shareButton)

    await waitFor(() => {
      expect(mockShare).toHaveBeenCalledWith({
        title: 'Petting Zoo Directory - Search Results',
        text: 'Check out these petting zoos!',
        url: expect.stringContaining('search=farm%20zoo')
      })
    })

    // Clean up
    delete navigator.share
  })

  it('applies custom className', () => {
    render(<ShareButton searchTerm={mockSearchTerm} filters={mockFilters} className="custom-class" />)
    
    const container = screen.getByTestId('share-button-container')
    expect(container).toHaveClass('share-button-container', 'custom-class')
  })
})