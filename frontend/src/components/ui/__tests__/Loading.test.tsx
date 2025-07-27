import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner, Loading, Skeleton, SkeletonText, SkeletonCard } from '../Loading';

describe('Spinner', () => {
  it('renders with default props', () => {
    render(<Spinner data-testid="spinner" />);
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
    expect(spinner).toHaveClass('h-6 w-6');
    expect(spinner).toHaveClass('text-primary-600');
  });

  it('renders different sizes', () => {
    const { rerender } = render(<Spinner size="sm" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveClass('h-4 w-4');

    rerender(<Spinner size="lg" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveClass('h-8 w-8');
  });

  it('renders different colors', () => {
    const { rerender } = render(<Spinner color="secondary" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveClass('text-secondary-600');

    rerender(<Spinner color="white" data-testid="spinner" />);
    expect(screen.getByTestId('spinner')).toHaveClass('text-white');
  });
});

describe('Loading', () => {
  it('renders with default text', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom text', () => {
    render(<Loading text="Please wait" />);
    expect(screen.getByText('Please wait')).toBeInTheDocument();
  });

  it('renders spinner with correct size', () => {
    render(<Loading size="lg" data-testid="loading" />);
    const spinner = screen.getByTestId('loading').querySelector('[class*="animate-spin"]');
    expect(spinner).toHaveClass('h-8 w-8');
  });
});

describe('Skeleton', () => {
  it('renders with default props', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('animate-pulse');
    expect(skeleton).toHaveClass('bg-gray-200');
    expect(skeleton).toHaveClass('rounded');
  });

  it('renders as rounded when specified', () => {
    render(<Skeleton rounded data-testid="skeleton" />);
    expect(screen.getByTestId('skeleton')).toHaveClass('rounded-full');
  });

  it('applies custom width and height', () => {
    render(<Skeleton width="100px" height="50px" data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px', height: '50px' });
  });
});

describe('SkeletonText', () => {
  it('renders default number of lines', () => {
    render(<SkeletonText data-testid="skeleton-text" />);
    const container = screen.getByTestId('skeleton-text');
    const lines = container.querySelectorAll('[class*="animate-pulse"]');
    expect(lines).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    render(<SkeletonText lines={5} data-testid="skeleton-text" />);
    const container = screen.getByTestId('skeleton-text');
    const lines = container.querySelectorAll('[class*="animate-pulse"]');
    expect(lines).toHaveLength(5);
  });
});

describe('SkeletonCard', () => {
  it('renders without avatar by default', () => {
    render(<SkeletonCard data-testid="skeleton-card" />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toBeInTheDocument();
    // Should not have avatar skeleton (rounded skeleton)
    const roundedSkeletons = card.querySelectorAll('[class*="rounded-full"]');
    expect(roundedSkeletons).toHaveLength(0);
  });

  it('renders with avatar when specified', () => {
    render(<SkeletonCard showAvatar data-testid="skeleton-card" />);
    const card = screen.getByTestId('skeleton-card');
    // Should have avatar skeleton (rounded skeleton)
    const roundedSkeletons = card.querySelectorAll('[class*="rounded-full"]');
    expect(roundedSkeletons.length).toBeGreaterThan(0);
  });
});