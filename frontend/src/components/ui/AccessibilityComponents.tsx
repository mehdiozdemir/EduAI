import React, { useEffect, useState } from 'react';
import { cn } from '../../utils';

/**
 * Hook for managing focus for accessibility
 */
export const useFocusManagement = () => {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const trapFocus = (containerRef: React.RefObject<HTMLElement | null>) => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  };

  const restoreFocus = () => {
    if (focusedElement) {
      focusedElement.focus();
      setFocusedElement(null);
    }
  };

  const saveFocus = () => {
    setFocusedElement(document.activeElement as HTMLElement);
  };

  return {
    trapFocus,
    restoreFocus,
    saveFocus
  };
};

/**
 * Skip navigation link for keyboard users
 */
interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  className = ''
}) => {
  return (
    <a
      href={href}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 bg-blue-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500',
        className
      )}
    >
      {children}
    </a>
  );
};

/**
 * Screen reader only text component
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  className?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  className = ''
}) => {
  return (
    <span className={cn('sr-only', className)}>
      {children}
    </span>
  );
};

/**
 * Accessible modal component
 */
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = ''
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const { trapFocus, saveFocus, restoreFocus } = useFocusManagement();

  useEffect(() => {
    if (isOpen) {
      saveFocus();
      const cleanup = trapFocus(modalRef);
      
      // Focus first focusable element
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        firstFocusable?.focus();
      }, 100);

      // Handle ESC key
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';

      return () => {
        cleanup?.();
        document.removeEventListener('keydown', handleEsc);
        document.body.style.overflow = '';
        restoreFocus();
      };
    }
  }, [isOpen, trapFocus, saveFocus, restoreFocus, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          ref={modalRef}
          className={cn(
            'relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6',
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 id="modal-title" className="text-xl font-semibold">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Modalı kapat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Accessible form field component
 */
interface AccessibleFieldProps {
  label: string;
  id: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  label,
  id,
  error,
  hint,
  required = false,
  children,
  className = ''
}) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('mb-4', className)}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="zorunlu alan">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-sm text-gray-600 mb-2">
          {hint}
        </p>
      )}

      <div className="relative">
        {React.isValidElement(children) && React.cloneElement(children, {
          id,
          'aria-describedby': [hintId, errorId].filter(Boolean).join(' '),
          'aria-invalid': error ? 'true' : 'false',
          required
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-red-600 mt-1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

/**
 * Accessible button with loading state
 */
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200';
  
  const variantClasses = {
    primary: 'border-transparent bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'border-transparent bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(baseClasses, variantClasses[variant], className)}
      aria-label={ariaLabel}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

/**
 * Accessible announcement component for screen readers
 */
interface LiveAnnouncementProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

export const LiveAnnouncement: React.FC<LiveAnnouncementProps> = ({
  message,
  priority = 'polite'
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear after announcement
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};

/**
 * Keyboard navigation helper hook
 */
export const useKeyboardNavigation = (
  items: HTMLElement[],
  isActive: boolean = true
) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setCurrentIndex(prev => (prev + 1) % items.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setCurrentIndex(prev => (prev - 1 + items.length) % items.length);
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(items.length - 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          items[currentIndex]?.click();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, currentIndex, isActive]);

  useEffect(() => {
    if (isActive && items[currentIndex]) {
      items[currentIndex].focus();
    }
  }, [currentIndex, items, isActive]);

  return { currentIndex, setCurrentIndex };
};

export default {
  useFocusManagement,
  SkipLink,
  ScreenReaderOnly,
  AccessibleModal,
  AccessibleField,
  AccessibleButton,
  LiveAnnouncement,
  useKeyboardNavigation
};
