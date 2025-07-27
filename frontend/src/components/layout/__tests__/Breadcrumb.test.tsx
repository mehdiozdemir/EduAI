import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumb from '../Breadcrumb';
import type { BreadcrumbItem } from '../Breadcrumb';

// Wrapper component for router
const RouterWrapper: React.FC<{ children: React.ReactNode; initialEntries?: string[] }> = ({ 
  children, 
  initialEntries = ['/'] 
}) => (
  <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
);

describe('Breadcrumb', () => {
  it('renders custom breadcrumb items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details', isActive: true },
    ];

    render(
      <RouterWrapper>
        <Breadcrumb items={items} />
      </RouterWrapper>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Details')).toBeInTheDocument();
  });

  it('renders links for non-active items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details', isActive: true },
    ];

    render(
      <RouterWrapper>
        <Breadcrumb items={items} />
      </RouterWrapper>
    );

    const homeLink = screen.getByRole('link', { name: 'Home' });
    const productsLink = screen.getByRole('link', { name: 'Products' });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(productsLink).toHaveAttribute('href', '/products');
    
    // Details should not be a link since it's active
    expect(screen.queryByRole('link', { name: 'Details' })).not.toBeInTheDocument();
  });

  it('generates breadcrumbs from current route when no items provided', () => {
    render(
      <RouterWrapper initialEntries={['/subjects']}>
        <Breadcrumb />
      </RouterWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Subjects')).toBeInTheDocument();
  });

  it('handles dashboard route correctly', () => {
    render(
      <RouterWrapper initialEntries={['/dashboard']}>
        <Breadcrumb />
      </RouterWrapper>
    );

    // Should not render breadcrumb for single item (dashboard only)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('handles root route correctly', () => {
    render(
      <RouterWrapper initialEntries={['/']}>
        <Breadcrumb />
      </RouterWrapper>
    );

    // Should not render breadcrumb for single item (dashboard only)
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('handles unknown routes with fallback', () => {
    render(
      <RouterWrapper initialEntries={['/unknown-route']}>
        <Breadcrumb />
      </RouterWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Page')).toBeInTheDocument();
  });

  it('renders separators between breadcrumb items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Products', href: '/products' },
      { label: 'Details', isActive: true },
    ];

    const { container } = render(
      <RouterWrapper>
        <Breadcrumb items={items} />
      </RouterWrapper>
    );

    // Check for chevron separators (should be 2 for 3 items)
    const separators = container.querySelectorAll('svg');
    expect(separators).toHaveLength(2);
  });

  it('applies custom className when provided', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isActive: true },
    ];

    const { container } = render(
      <RouterWrapper>
        <Breadcrumb items={items} className="custom-breadcrumb" />
      </RouterWrapper>
    );

    const nav = container.querySelector('nav');
    expect(nav).toHaveClass('custom-breadcrumb');
  });

  it('sets aria-current for active items', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Current', isActive: true },
    ];

    render(
      <RouterWrapper>
        <Breadcrumb items={items} />
      </RouterWrapper>
    );

    const activeItem = screen.getByText('Current');
    expect(activeItem).toHaveAttribute('aria-current', 'page');
  });

  it('does not render when only one item is provided', () => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', isActive: true },
    ];

    const { container } = render(
      <RouterWrapper>
        <Breadcrumb items={items} />
      </RouterWrapper>
    );

    expect(container.firstChild).toBeNull();
  });

  it('handles performance route correctly', () => {
    render(
      <RouterWrapper initialEntries={['/performance']}>
        <Breadcrumb />
      </RouterWrapper>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
  });
});