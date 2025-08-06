import { render, screen, fireEvent } from '@testing-library/react'
import AnimalSection from '../AnimalSection'

// Mock AnimalCard component
jest.mock('../AnimalCard', () => {
  return function MockAnimalCard({ animal }) {
    return (
      <div data-testid="mock-animal-card">
        {animal.name} - {animal.species}
      </div>
    )
  }
})

describe('AnimalSection', () => {
  const mockAnimals = [
    {
      _id: '1',
      name: 'Bella',
      species: 'Goat',
      category: 'Farm Animals',
      canPet: true,
      canFeed: true
    },
    {
      _id: '2',
      name: 'Rex',
      species: 'Dog',
      category: 'Domestic Animals',
      canPet: true,
      canFeed: false
    },
    {
      _id: '3',
      name: 'Spike',
      species: 'Hedgehog',
      category: 'Small Animals',
      canPet: false,
      canFeed: true
    }
  ]

  it('renders animals section with title and count', () => {
    render(<AnimalSection animals={mockAnimals} title="Zoo Animals" />)
    
    expect(screen.getByText('Zoo Animals')).toBeInTheDocument()
    expect(screen.getByText('3 of 3 animals')).toBeInTheDocument()
  })

  it('renders all animals by default', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    expect(screen.getByText('Bella - Goat')).toBeInTheDocument()
    expect(screen.getByText('Rex - Dog')).toBeInTheDocument()
    expect(screen.getByText('Spike - Hedgehog')).toBeInTheDocument()
  })

  it('filters animals by category', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Farm Animals' } })
    
    expect(screen.getByText('Bella - Goat')).toBeInTheDocument()
    expect(screen.queryByText('Rex - Dog')).not.toBeInTheDocument()
    expect(screen.queryByText('Spike - Hedgehog')).not.toBeInTheDocument()
    expect(screen.getByText('1 of 3 animals')).toBeInTheDocument()
  })

  it('filters animals by interaction type', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    const interactionSelect = screen.getByDisplayValue('All Animals')
    fireEvent.change(interactionSelect, { target: { value: 'petting' } })
    
    expect(screen.getByText('Bella - Goat')).toBeInTheDocument()
    expect(screen.getByText('Rex - Dog')).toBeInTheDocument()
    expect(screen.queryByText('Spike - Hedgehog')).not.toBeInTheDocument()
    expect(screen.getByText('2 of 3 animals')).toBeInTheDocument()
  })

  it('shows no results message when filters match no animals', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Exotic Animals' } })
    
    expect(screen.getByText('No animals match the selected filters.')).toBeInTheDocument()
    expect(screen.getByText('Reset Filters')).toBeInTheDocument()
  })

  it('resets filters when reset button is clicked', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    // Apply filters
    const categorySelect = screen.getByDisplayValue('All Categories')
    fireEvent.change(categorySelect, { target: { value: 'Farm Animals' } })
    
    // Click reset
    const resetButton = screen.getByText('Reset Filters')
    fireEvent.click(resetButton)
    
    // Check that all animals are shown again
    expect(screen.getByText('3 of 3 animals')).toBeInTheDocument()
  })

  it('handles empty animals array', () => {
    render(<AnimalSection animals={[]} />)
    
    expect(screen.getByText('No animals information available yet.')).toBeInTheDocument()
  })

  it('handles undefined animals prop', () => {
    render(<AnimalSection />)
    
    expect(screen.getByText('No animals information available yet.')).toBeInTheDocument()
  })

  it('uses default title when none provided', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    expect(screen.getByText('Animals')).toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<AnimalSection animals={mockAnimals} />)
    
    const section = screen.getByTestId('animal-section')
    expect(section).toHaveClass('animal-section')
  })
})