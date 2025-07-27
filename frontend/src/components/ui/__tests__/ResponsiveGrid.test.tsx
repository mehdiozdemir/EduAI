import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveGrid from '../ResponsiveGrid';

describe('ResponsiveGrid', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveGrid>
        <div>Item 1</div>
        <div>Item 2</div>
      </ResponsiveGrid>
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('applies default grid columns', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
  });

  it('applies custom grid columns', () => {
    const { container } = render(
      <ResponsiveGrid cols={{ default: 2, md: 4, xl: 6 }}>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid-cols-2', 'md:grid-cols-4', 'xl:grid-cols-6');
  });

  it('applies correct gap classes', () => {
    const { container } = render(
      <ResponsiveGrid gap="lg">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('gap-5', 'sm:gap-6', 'lg:gap-8');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveGrid className="custom-grid">
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('custom-grid');
  });

  it('applies base grid class', () => {
    const { container } = render(
      <ResponsiveGrid>
        <div>Item 1</div>
      </ResponsiveGrid>
    );

    const gridElement = container.firstChild as HTMLElement;
    expect(gridElement).toHaveClass('grid');
  });
});