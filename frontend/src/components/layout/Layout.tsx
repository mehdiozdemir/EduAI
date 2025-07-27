import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { cn } from '../../utils';
import Header from './Header';
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
  const { user, logout } = useAuth();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className={cn('min-h-screen bg-gray-50', className)}>
      <OfflineNotification />
      <ErrorBoundary>
        {/* Header */}
        <Header user={user || undefined} onLogout={handleLogout} />

        <div className="flex min-h-[calc(100vh-4rem)]">
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
              'flex-1 min-h-[calc(100vh-4rem)]',
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