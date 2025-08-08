import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import SimpleSearchBar from '../SimpleSearchBar'

describe('SimpleSearchBar', () => {
  const mockOnSearch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear any existing timeouts
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('renders search input with placeholder', () => {
    render(<SimpleSearchBar placeholder="Search zoos..." />)
    
    const input = screen.getByTestId('search-input')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('placeholder', 'Search zoos...')
  })

  it('uses default placeholder when none provided', () => {
    render(<SimpleSearchBar />)
    
    const input = screen.getByTestId('search-input')
    expect(input).toHaveAttribute('placeholder', 'Search petting zoos...')
  })

  it('calls onSearch when user types (debounced)', async () => {
    render(<SimpleSearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input')
    fireEvent.change(input, { target: { value: 'farm zoo' } })
    
    // Should not call immediately
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Fast-forward time to trigger debounced call
    jest.advanceTimersByTime(300)
    
    expect(mockOnSearch).toHaveBeenCalledWith('farm zoo')
  })

  it('calls onSearch when form is submitted', () => {
    render(<SimpleSearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: 'wildlife zoo' } })
    fireEvent.submit(form)
    
    expect(mockOnSearch).toHaveBeenCalledWith('wildlife zoo')
  })

  it('shows clear button when there is text', () => {
    render(<SimpleSearchBar />)
    
    const input = screen.getByTestId('search-input')
    
    // Initially no clear button
    expect(screen.queryByTestId('clear-search-button')).not.toBeInTheDocument()
    
    // Type something
    fireEvent.change(input, { target: { value: 'test' } })
    
    // Clear button should appear
    expect(screen.getByTestId('clear-search-button')).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', () => {
    render(<SimpleSearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input')
    
    // Type something
    fireEvent.change(input, { target: { value: 'test search' } })
    expect(input.value).toBe('test search')
    
    // Click clear button
    const clearButton = screen.getByTestId('clear-search-button')
    fireEvent.click(clearButton)
    
    // Input should be cleared
    expect(input.value).toBe('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('disables search button when input is empty', () => {
    render(<SimpleSearchBar />)
    
    const searchButton = screen.getByTestId('search-submit-button')
    expect(searchButton).toBeDisabled()
    
    // Type something
    const input = screen.getByTestId('search-input')
    fireEvent.change(input, { target: { value: 'test' } })
    
    expect(searchButton).not.toBeDisabled()
  })

  it('trims whitespace from search term', () => {
    render(<SimpleSearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    fireEvent.change(input, { target: { value: '  spaced search  ' } })
    fireEvent.submit(form)
    
    expect(mockOnSearch).toHaveBeenCalledWith('spaced search')
  })

  it('sets initial value when provided', () => {
    render(<SimpleSearchBar initialValue="initial search" />)
    
    const input = screen.getByTestId('search-input')
    expect(input.value).toBe('initial search')
  })

  it('prevents form submission when input is empty or whitespace only', () => {
    render(<SimpleSearchBar onSearch={mockOnSearch} />)
    
    const input = screen.getByTestId('search-input')
    const form = input.closest('form')
    
    // Try to submit with empty input
    fireEvent.submit(form)
    expect(mockOnSearch).not.toHaveBeenCalled()
    
    // Try to submit with whitespace only
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.submit(form)
    expect(mockOnSearch).not.toHaveBeenCalled()
  })

  it('applies correct CSS classes', () => {
    render(<SimpleSearchBar />)
    
    const container = screen.getByTestId('simple-search-bar')
    expect(container).toHaveClass('simple-search-bar')
  })
})