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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [windowWidth, setWindowWidth] = useState(0);

  // Alternative mobile detection
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // Set initial width
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileAlt = windowWidth < 768; // md breakpoint



  // Auto-close sidebar on mobile when screen size changes
  useEffect(() => {
    if (windowWidth >= 768) { // Desktop size
      setIsSidebarOpen(false);
    }
  }, [windowWidth]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (windowWidth < 768 && isSidebarOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        // Don't close if clicking on hamburger button or sidebar content
        if (target.closest('[data-sidebar]') || target.closest('[data-hamburger]')) {
          return;
        }
        setIsSidebarOpen(false);
      };

      // Use a small delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside);
      };
    }
  }, [windowWidth, isSidebarOpen]);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Close sidebar on left swipe
    if (isLeftSwipe && isSidebarOpen) {
      setIsSidebarOpen(false);
    }

    // Open sidebar on right swipe from left edge
    if (isRightSwipe && !isSidebarOpen && touchStart < 50) {
      setIsSidebarOpen(true);
    }
  };

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

          {/* Mobile Sidebar Overlay */}
          {showSidebar && isSidebarOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden animate-fade-in"
                onClick={() => setIsSidebarOpen(false)}
              />
              {/* Mobile Sidebar */}
              <div
                data-sidebar
                className="fixed inset-y-0 left-0 z-50 w-64 md:hidden animate-slide-in-left"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={(e) => e.stopPropagation()}
              >
                <ErrorBoundary>
                  <Sidebar
                    currentPath={window.location.pathname}
                    user={user || undefined}
                    onClose={() => setIsSidebarOpen(false)}
                  />
                </ErrorBoundary>
              </div>
            </>
          )}

          {/* Main Content */}
          <main
            className={cn(
              'flex-1 min-h-screen',
              contentClassName
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Mobile Header with Hamburger Menu */}
            {showSidebar && (
              <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <button
                  data-hamburger
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidebarOpen(true);
                  }}
                  className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-200"
                  aria-label="Menüyü aç"
                >
                  <svg className="w-6 h-6 transition-transform duration-200 hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Mobile Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-sm">
                    <span className="text-white font-bold text-sm">EA</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">EduAI</span>
                </div>

                {/* User Avatar for Mobile */}
                {user && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-primary-600 font-medium text-sm">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}

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