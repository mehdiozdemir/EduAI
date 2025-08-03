import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils';
import type { User } from '../../types';

interface SidebarProps {
  currentPath: string;
  user?: User;
  className?: string;
  onClose?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Ana Sayfa',
    href: '/app/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
    description: 'Genel Bakış ve Hızlı Erişim',
  },
  {
    name: 'Deneme Sınavı',
    href: '/app/practice-exam',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    description: 'Gerçek sınav formatında deneme sınavları çözün',
  },
  {
    name: 'Sınav Geçmişi',
    href: '/app/practice-exam-history',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    description: 'Geçmiş sınavlarınızı ve performansınızı görüntüleyin',
  },
  {
    name: 'Soru Çözümü',
    href: '/app/subjects',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    description: 'Seviyeni ve Dersini Seç ve Soru Çözümüne Başla',
  },
  {
    name: 'Performans Takibi',
    href: '/app/performance',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    description: 'Öğrenme analizlerini görüntüle',
  },
  {
    name: 'Öneriler',
    href: '/app/recommendations',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    description: 'Kişiselleştirilmiş öğrenme kaynakları',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ user, className, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActiveRoute = (href: string): boolean => {
    if (href === '/app/dashboard') {
      return location.pathname === '/app' || location.pathname === '/app/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsUserMenuOpen(false);
    onClose?.(); // Close mobile sidebar when navigating
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col',
        'w-64 h-screen sticky top-0 overflow-y-auto shrink-0',
        onClose && 'shadow-xl', // Add shadow for mobile overlay
        className
      )}
      style={{ 
        /* Prevent layout shift during initial render */
        minHeight: '100vh',
        maxHeight: '100vh'
      }}
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            onClick={() => onClose?.()}
          >
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">EA</span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">EduAI</h2>
              <p className="text-sm text-gray-500">Learning Platform</p>
            </div>
          </Link>
          
          {/* Mobile Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Menüyü kapat"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = isActiveRoute(item.href);
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'flex items-center space-x-3 px-3 py-4 rounded-lg text-sm font-medium transition-all duration-200 touch-manipulation min-h-[48px]',
                'hover:bg-gray-50 active:bg-gray-100 group sm:py-3',
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-700 hover:text-gray-900'
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-400 group-hover:text-gray-600'
                )}
              >
                {item.icon}
              </span>
              <div className="flex-1">
                <div className="font-medium">{item.name}</div>
                {item.description && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {item.description}
                  </div>
                )}
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-primary-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Info Section */}
      {user && (
        <div className="p-4 border-t border-gray-200 space-y-3 relative" ref={userMenuRef}>
          {/* User Profile Button */}
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-medium text-sm">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.username}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
            {/* Dropdown Arrow */}
            <svg 
              className={cn(
                'w-4 h-4 transition-transform duration-200',
                isUserMenuOpen ? 'rotate-180' : ''
              )} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          
          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => handleNavigation('/app/profile')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Profil
                </button>

                <button
                  onClick={() => handleNavigation('/app/settings')}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Ayarlar
                </button>

                <hr className="my-1" />

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>&copy; 2024 EduAI Platform</p>
          <p className="mt-1">Powered by AI</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;