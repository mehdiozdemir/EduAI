import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { cn } from '../../utils';
import Sidebar from './Sidebar';
import Breadcrumb from './Breadcrumb';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { OfflineNotification } from '../ui/OfflineNotification';
import type { BreadcrumbItem } from './Breadcrumb';

interface LayoutProps {
  children?: React.ReactNode;
  showSidebar?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  className?: string;
  contentClassName?: string;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  showSidebar = true,
  breadcrumbItems,
  className,
  contentClassName,
}) => {
  const { user } = useAuth();
  const { isMobile } = useBreakpoint();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const handleClickOutside = () => setIsSidebarOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobile, isSidebarOpen]);

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <OfflineNotification />
      <ErrorBoundary>
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          {showSidebar && (
            <div className="hidden md:block">
              <ErrorBoundary>
                <Sidebar currentPath={window.location.pathname} user={user || undefined} />
              </ErrorBoundary>
            </div>
          )}

          {/* Main Content */}
          <main
            className={cn(
              'flex-1 min-h-screen',
              contentClassName
            )}
          >
            {/* Content Container */}
            <div className="p-4 sm:p-6 lg:p-8 min-h-full">
              {/* Breadcrumb */}
              {breadcrumbItems && (
                <div className="mb-4 sm:mb-6">
                  <ErrorBoundary>
                    <Breadcrumb items={breadcrumbItems} />
                  </ErrorBoundary>
                </div>
              )}

              {/* Page Content */}
              <div className="max-w-7xl mx-auto">
                <ErrorBoundary>
                  {children || <Outlet />}
                </ErrorBoundary>
              </div>
            </div>
          </main>
        </div>
      </ErrorBoundary>
    </div>
  );
};

export default Layout;