import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route to breadcrumb mapping
const routeBreadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard', isActive: true }],
  '/dashboard': [{ label: 'Dashboard', isActive: true }],
  '/subjects': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Subjects', isActive: true },
  ],
  '/quiz': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Quiz', isActive: true },
  ],
  '/performance': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Performance', isActive: true },
  ],
  '/recommendations': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Recommendations', isActive: true },
  ],
  '/profile': [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', isActive: true },
  ],
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();
  
  // Use provided items or generate from current route
  const breadcrumbItems = items || routeBreadcrumbMap[location.pathname] || [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Page', isActive: true },
  ];

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumb for single items
  }

  return (
    <nav
      className={cn('flex items-center space-x-1 text-sm', className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-400 mx-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'font-medium',
                    isLast || item.isActive
                      ? 'text-gray-900'
                      : 'text-gray-500'
                  )}
                  aria-current={isLast || item.isActive ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
export type { BreadcrumbItem, BreadcrumbProps };