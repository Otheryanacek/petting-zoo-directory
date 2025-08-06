import { render, screen } from '@testing-library/react'
import AnimalCard from '../AnimalCard'

// Mock sanity urlFor function
jest.mock('../../sanity', () => ({
  urlFor: jest.fn(() => ({
    width: jest.fn().mockReturnThis(),
    height: jest.fn().mockReturnThis(),
    crop: jest.fn().mockReturnThis(),
    auto: jest.fn().mockReturnValue('mocked-image-url')
  }))
}))

describe('AnimalCard', () => {
  const mockAnimal = {
    name: 'Bella',
    species: 'Goat',
    category: 'Farm Animals',
    image: { asset: { _ref: 'image-ref' } },
    description: 'A friendly goat who loves attention',
    canPet: true,
    canFeed: true,
    ageGroup: 'Adult',
    temperament: 'Gentle'
  }

  it('renders animal information correctly', () => {
    render(<AnimalCard animal={mockAnimal} />)
    
    expect(screen.getByText('Bella')).toBeInTheDocument()
    expect(screen.getByText('Goat')).toBeInTheDocument()
    expect(screen.getByText('Farm Animals')).toBeInTheDocument()
    expect(screen.getByText('A friendly goat who loves attention')).toBeInTheDocument()
    expect(screen.getByText('Can Pet')).toBeInTheDocument()
    expect(screen.getByText('Can Feed')).toBeInTheDocument()
    expect(screen.getByText('Adult')).toBeInTheDocument()
    expect(screen.getByText('Gentle')).toBeInTheDocument()
  })

  it('handles missing optional data gracefully', () => {
    const minimalAnimal = {
      name: 'Rex',
      species: 'Dog'
    }

    render(<AnimalCard animal={minimalAnimal} />)
    
    expect(screen.getByText('Rex')).toBeInTheDocument()
    expect(screen.getByText('Dog')).toBeInTheDocument()
    expect(screen.getByText('🐾')).toBeInTheDocument() // Placeholder emoji
  })

  it('shows interaction badges only when applicable', () => {
    const nonInteractiveAnimal = {
      name: 'Spike',
      species: 'Hedgehog',
      canPet: false,
      canFeed: false
    }

    render(<AnimalCard animal={nonInteractiveAnimal} />)
    
    expect(screen.queryByText('Can Pet')).not.toBeInTheDocument()
    expect(screen.queryByText('Can Feed')).not.toBeInTheDocument()
  })

  it('shows only petting interaction when canPet is true', () => {
    const pettingOnlyAnimal = {
      name: 'Fluffy',
      species: 'Rabbit',
      canPet: true,
      canFeed: false
    }

    render(<AnimalCard animal={pettingOnlyAnimal} />)
    
    expect(screen.getByText('Can Pet')).toBeInTheDocument()
    expect(screen.queryByText('Can Feed')).not.toBeInTheDocument()
  })

  it('applies correct CSS classes', () => {
    render(<AnimalCard animal={mockAnimal} />)
    
    const card = screen.getByTestId('animal-card')
    expect(card).toHaveClass('animal-card')
  })
})