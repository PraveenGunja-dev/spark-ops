/**
 * Unit tests for utility functions
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should handle false conditional classes', () => {
    const isActive = false;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class');
  });

  it('should merge tailwind classes with conflicts', () => {
    // tailwind-merge should keep the last one
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('should handle undefined and null', () => {
    const result = cn('base', undefined, null, 'class');
    expect(result).toBe('base class');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class-1', 'class-2'], 'class-3');
    expect(result).toBe('class-1 class-2 class-3');
  });

  it('should handle objects with conditional values', () => {
    const result = cn({
      'base-class': true,
      'active-class': true,
      'hidden-class': false,
    });
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('hidden-class');
  });
});
