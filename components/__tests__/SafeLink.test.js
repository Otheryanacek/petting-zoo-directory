import React from 'react'
import { render, screen } from '@testing-library/react'
import SafeLink from '../SafeLink'

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ href, children, ...props }) {
    return <a href={href} {...props}>{children}</a>
  }
})

// Mock validation utility
jest.mock('../../utils/validation', () => ({
  validateSlugData: jest.fn()
}))

const { validateSlugData } = require('../../utils/validation')

describe('SafeLink', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders link with valid href', () => {
    render(
      <SafeLink href="/test-page">
        Test Link
      </SafeLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test-page')
    expect(link).toHaveTextContent('Test Link')
  })

  it('renders link with valid slug', () => {
    const mockSlug = { current: 'test-zoo' }
    
    validateSlugData.mockReturnValue({
      isValid: true,
      data: mockSlug,
      errors: [],
      warnings: []
    })

    render(
      <SafeLink slug={mockSlug} basePath="/zoo">
        Zoo Link
      </SafeLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/zoo/test-zoo')
    expect(link).toHaveTextContent('Zoo Link')
  })

  it('renders fallback when slug is invalid', () => {
    const mockSlug = { current: null }
    
    validateSlugData.mockReturnValue({
      isValid: false,
      data: { current: null },
      errors: ['Slug missing current value'],
      warnings: []
    })

    render(
      <SafeLink slug={mockSlug}>
        Invalid Link
      </SafeLink>
    )
    
    const fallback = screen.getByText('Invalid Link')
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback).toHaveClass('safe-link-fallback')
    expect(fallback).toHaveStyle('text-decoration: line-through')
  })

  it('renders fallback when no href or slug provided', () => {
    render(
      <SafeLink>
        No Link Data
      </SafeLink>
    )
    
    const fallback = screen.getByText('No Link Data')
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback).toHaveClass('safe-link-fallback')
  })

  it('renders external link with proper attributes', () => {
    render(
      <SafeLink href="https://example.com">
        External Link
      </SafeLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('blocks dangerous protocols', () => {
    render(
      <SafeLink href="javascript:alert('xss')">
        Dangerous Link
      </SafeLink>
    )
    
    const fallback = screen.getByText('Dangerous Link')
    expect(fallback.tagName).toBe('SPAN')
    expect(fallback).toHaveClass('safe-link-fallback')
  })

  it('renders disabled state', () => {
    render(
      <SafeLink href="/test" disabled>
        Disabled Link
      </SafeLink>
    )
    
    const disabled = screen.getByText('Disabled Link')
    expect(disabled.tagName).toBe('SPAN')
    expect(disabled).toHaveClass('safe-link-disabled')
    expect(disabled).toHaveStyle('cursor: not-allowed')
  })

  it('uses custom fallback component', () => {
    const CustomFallback = () => <div>Custom Fallback</div>
    
    render(
      <SafeLink 
        href=""
        fallbackComponent={CustomFallback}
      >
        Test
      </SafeLink>
    )
    
    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
  })

  it('calls onError callback for invalid data', () => {
    const onError = jest.fn()
    
    validateSlugData.mockReturnValue({
      isValid: false,
      data: { current: null },
      errors: ['Invalid slug'],
      warnings: []
    })

    render(
      <SafeLink slug={{ current: null }} onError={onError}>
        Test
      </SafeLink>
    )
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        isValid: false,
        errors: ['Invalid slug']
      })
    )
  })

  it('sanitizes relative paths by adding leading slash', () => {
    render(
      <SafeLink href="test-page">
        Relative Link
      </SafeLink>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/test-page')
  })

  it('handles mailto and tel links as external', () => {
    render(
      <>
        <SafeLink href="mailto:test@example.com">Email</SafeLink>
        <SafeLink href="tel:+1234567890">Phone</SafeLink>
      </>
    )
    
    const emailLink = screen.getByText('Email')
    const phoneLink = screen.getByText('Phone')
    
    expect(emailLink).toHaveAttribute('href', 'mailto:test@example.com')
    expect(emailLink).toHaveAttribute('target', '_blank')
    
    expect(phoneLink).toHaveAttribute('href', 'tel:+1234567890')
    expect(phoneLink).toHaveAttribute('target', '_blank')
  })
})