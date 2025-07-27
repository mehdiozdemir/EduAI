import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('base-class', 'additional-class');
    expect(result).toBe('base-class additional-class');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
    expect(result).toBe('base-class conditional-class');
  });

  it('should handle undefined and null values', () => {
    const result = cn('base-class', undefined, null, 'valid-class');
    expect(result).toBe('base-class valid-class');
  });

  it('should handle empty strings', () => {
    const result = cn('base-class', '', 'valid-class');
    expect(result).toBe('base-class valid-class');
  });

  it('should merge Tailwind classes correctly', () => {
    const result = cn('p-4', 'p-2'); // Should keep the last padding class
    expect(result).toContain('p-2');
    expect(result).not.toContain('p-4');
  });

  it('should handle complex Tailwind class merging', () => {
    const result = cn(
      'bg-red-500 text-white p-4',
      'bg-blue-500 p-2', // Should override bg and padding
      'hover:bg-green-500' // Should be preserved
    );
    
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('text-white');
    expect(result).toContain('p-2');
    expect(result).toContain('hover:bg-green-500');
    expect(result).not.toContain('bg-red-500');
    expect(result).not.toContain('p-4');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['base-class', 'array-class'], 'string-class');
    expect(result).toBe('base-class array-class string-class');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      'base-class': true,
      'conditional-class': true,
      'hidden-class': false,
    });
    expect(result).toBe('base-class conditional-class');
  });

  it('should handle mixed input types', () => {
    const result = cn(
      'base-class',
      ['array-class'],
      { 'object-class': true, 'hidden-class': false },
      'final-class'
    );
    expect(result).toBe('base-class array-class object-class final-class');
  });
});