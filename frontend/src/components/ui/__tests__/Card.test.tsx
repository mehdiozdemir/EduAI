import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card, { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../Card';

describe('Card', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders different elevations', () => {
    const { rerender } = render(<Card elevation="sm" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('shadow-sm');

    rerender(<Card elevation="lg" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('shadow-lg');
  });

  it('renders different padding sizes', () => {
    const { rerender } = render(<Card padding="sm" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('p-3');

    rerender(<Card padding="lg" data-testid="card">Content</Card>);
    expect(screen.getByTestId('card')).toHaveClass('p-6');
  });

  it('renders with sub-components', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card Description')).toBeInTheDocument();
    expect(screen.getByText('Card Content')).toBeInTheDocument();
    expect(screen.getByText('Card Footer')).toBeInTheDocument();
  });
});