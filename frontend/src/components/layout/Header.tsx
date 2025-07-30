import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileNavigation } from './MobileNavigation';
import type { User } from '../../types';

interface HeaderProps {
  user?: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Header.handleLogout called');
    try {
      await onLogout();
      console.log('Header.handleLogout completed successfully');
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Header.handleLogout failed:', error);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">EA</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">EduAI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/app/dashboard"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/app/subjects"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Subjects
            </Link>
            <Link
              to="/app/performance"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Performance
            </Link>
          </nav>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="hidden md:block text-gray-700 font-medium">
                  {user.username}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isUserMenuOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    <div className="font-medium text-gray-900">{user.username}</div>
                    <div className="text-xs">{user.email}</div>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    onMouseDown={(e) => console.log('Button mousedown:', e)}
                    onMouseUp={(e) => console.log('Button mouseup:', e)}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    type="button"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 font-medium text-sm">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 touch-manipulation min-h-[44px] min-w-[44px] transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open main menu'}</span>
              <svg
                className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6 transition-transform`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6 transition-transform`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation
        user={user}
        onLogout={onLogout}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Header;