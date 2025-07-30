import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSmoothScrollNavigation, useScrollPosition } from '../../hooks/useSmoothScroll';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { LoginCTA, RegisterCTA } from './sections/AuthAwareCTA';
import { UserProfileDropdown } from './sections/UserProfileDropdown';

interface LandingHeaderProps {
  className?: string;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ className }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { scrollToSection, activeSection } = useSmoothScrollNavigation();
  const { scrollY } = useScrollPosition();

  // Header background blur effect when scrolled
  const isScrolled = scrollY > 10;

  // Navigation items for landing page
  const navigationItems = [
    { name: 'Features', section: 'features' },
    { name: 'How It Works', section: 'how-it-works' },
    { name: 'Statistics', section: 'statistics' },
    { name: 'Testimonials', section: 'testimonials' },
  ];

  // Handle navigation click
  const handleNavClick = (section: string) => {
    scrollToSection(section);
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleClickOutside = () => setIsMobileMenuOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/50'
            : 'bg-transparent',
          className
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex items-center space-x-3 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
                <span>EduAI</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium transition-colors rounded-md relative',
                    activeSection === item.section
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  )}
                >
                  {item.name}
                  {activeSection === item.section && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              ))}
            </nav>

            {/* CTA Buttons or User Profile */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : isAuthenticated ? (
                <UserProfileDropdown />
              ) : (
                <>
                  <LoginCTA
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                    variant="ghost"
                  />
                  <RegisterCTA
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                  />
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                <svg
                  className={cn(
                    'h-6 w-6 transition-transform duration-200',
                    isMobileMenuOpen ? 'rotate-90' : ''
                  )}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Slide-out Panel */}
      <div
        className={cn(
          'fixed inset-0 z-40 md:hidden transition-opacity duration-300',
          isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

        {/* Slide-out panel */}
        <div
          className={cn(
            'absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out',
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <span className="text-lg font-semibold text-gray-900">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <svg className="h-5 w-5" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-6 py-4 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.section}
                  onClick={() => handleNavClick(item.section)}
                  className={cn(
                    'w-full text-left px-4 py-3 text-base font-medium rounded-lg transition-colors',
                    activeSection === item.section
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {item.name}
                </button>
              ))}
            </nav>

            {/* CTA Buttons or User Profile */}
            <div className="px-6 py-6 border-t border-gray-200 space-y-3">
              {isLoading ? (
                <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              ) : isAuthenticated ? (
                <UserProfileDropdown className="w-full" />
              ) : (
                <>
                  <LoginCTA
                    className="block w-full px-4 py-3 text-center text-base font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    variant="outline"
                  />
                  <RegisterCTA
                    className="block w-full px-4 py-3 text-center text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LandingHeader;
