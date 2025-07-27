import React from 'react';
import { render, screen } from '@testing-library/react';
import ResponsiveContainer from '../ResponsiveContainer';

describe('ResponsiveContainer', () => {
  it('renders children correctly', () => {
    render(
      <ResponsiveContainer>
        <div>Test content</div>
      </ResponsiveContainer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(
      <ResponsiveContainer size="sm">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('max-w-sm');
  });

  it('applies correct padding classes', () => {
    const { container } = render(
      <ResponsiveContainer padding="lg">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('px-6', 'sm:px-8', 'lg:px-12');
  });

  it('applies custom className', () => {
    const { container } = render(
      <ResponsiveContainer className="custom-class">
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('custom-class');
  });

  it('applies default props correctly', () => {
    const { container } = render(
      <ResponsiveContainer>
        <div>Test content</div>
      </ResponsiveContainer>
    );

    const containerElement = container.firstChild as HTMLElement;
    expect(containerElement).toHaveClass('max-w-4xl', 'px-4', 'sm:px-6', 'lg:px-8');
  });
});