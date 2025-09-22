import { cn } from '../utils'
import '@testing-library/jest-dom'

describe('Utility functions', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
    })

    it('handles conditional classes', () => {
      expect(cn('bg-red-500', true && 'text-white', false && 'text-black')).toBe('bg-red-500 text-white')
    })

    it('handles undefined and null values', () => {
      expect(cn('bg-red-500', undefined, null, 'text-white')).toBe('bg-red-500 text-white')
    })

    it('handles empty strings', () => {
      expect(cn('bg-red-500', '', 'text-white', '')).toBe('bg-red-500 text-white')
    })
  })
})
