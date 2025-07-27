import React, { useEffect, useRef } from 'react';
import { cn } from '../../utils';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizes = {
    sm: isMobile ? 'max-w-[calc(100vw-2rem)] mx-4' : 'max-w-sm mx-4 sm:max-w-md',
    md: isMobile ? 'max-w-[calc(100vw-2rem)] mx-4' : 'max-w-md mx-4 sm:max-w-lg',
    lg: isMobile ? 'max-w-[calc(100vw-2rem)] mx-4' : 'max-w-lg mx-4 sm:max-w-2xl',
    xl: isMobile ? 'max-w-[calc(100vw-2rem)] mx-4' : 'max-w-xl mx-4 sm:max-w-4xl',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className={cn(
          'flex min-h-full justify-center text-center',
          isMobile ? 'items-end p-0' : 'items-center p-4 sm:p-0'
        )}
        onClick={handleOverlayClick}
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        />

        {/* Modal panel */}
        <div
          ref={modalRef}
          className={cn(
            'relative transform overflow-hidden bg-white text-left shadow-xl transition-all w-full',
            isMobile 
              ? 'rounded-t-lg max-h-[90vh] overflow-y-auto' 
              : 'rounded-lg my-4 sm:my-8',
            sizes[size]
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full pr-8 sm:pr-0">
                  {title && (
                    <h3 className="text-base sm:text-lg font-semibold leading-6 text-gray-900">
                      {title}
                    </h3>
                  )}
                  {description && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  className="absolute right-4 top-4 p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                  onClick={onClose}
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'bg-white',
            (title || description) ? 'px-4 pb-4 sm:px-6 sm:pb-6' : 'p-6'
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal sub-components for better composition
export interface ModalHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, onClose }) => (
  <div className="flex items-center justify-between p-6 border-b border-gray-200">
    <div>{children}</div>
    {onClose && (
      <button
        type="button"
        className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        onClick={onClose}
      >
        <span className="sr-only">Close</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    )}
  </div>
);

export interface ModalBodyProps {
  children: React.ReactNode;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <div className="p-6">{children}</div>
);

export interface ModalFooterProps {
  children: React.ReactNode;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <div className="flex items-center justify-end space-x-2 p-6 border-t border-gray-200 bg-gray-50">
    {children}
  </div>
);

// Confirmation Modal component
export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  loading = false,
}) => {
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="sm:flex sm:items-start">
        <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
          {variant === 'danger' && (
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )}
          {variant === 'warning' && (
            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          )}
          {variant === 'info' && (
            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          )}
        </div>
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            {title}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </div>
      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          className={cn(
            'inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto',
            variantStyles[variant],
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            loading && 'opacity-50 cursor-not-allowed'
          )}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Loading...' : confirmText}
        </button>
        <button
          type="button"
          className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </button>
      </div>
    </Modal>
  );
};

export default Modal;