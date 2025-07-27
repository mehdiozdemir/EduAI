import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { cn } from '../../utils';

interface OfflineNotificationProps {
  className?: string;
  showReconnected?: boolean;
  reconnectedDuration?: number;
}

export const OfflineNotification: React.FC<OfflineNotificationProps> = ({
  className,
  showReconnected = true,
  reconnectedDuration = 3000,
}) => {
  const [showReconnectedMessage, setShowReconnectedMessage] = React.useState(false);

  const { isOffline, wasOffline } = useOffline({
    onOnline: () => {
      if (showReconnected && wasOffline) {
        setShowReconnectedMessage(true);
        setTimeout(() => {
          setShowReconnectedMessage(false);
        }, reconnectedDuration);
      }
    },
  });

  if (!isOffline && !showReconnectedMessage) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-transform duration-300',
        isOffline ? 'translate-y-0' : showReconnectedMessage ? 'translate-y-0' : '-translate-y-full',
        className
      )}
    >
      {isOffline ? (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 5.636l-12.728 12.728m0-12.728l12.728 12.728"
              />
            </svg>
            <span>You're offline. Some features may not be available.</span>
          </div>
        </div>
      ) : (
        <div className="bg-green-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>You're back online!</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Inline offline indicator for specific components
export const OfflineIndicator: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ className, size = 'md' }) => {
  const { isOffline } = useOffline();

  if (!isOffline) {
    return null;
  }

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-1 text-red-600',
        className
      )}
      title="You are currently offline"
    >
      <div className={cn('rounded-full bg-red-600', sizes[size])} />
      <span className="text-xs font-medium">Offline</span>
    </div>
  );
};

// Connection status component
export const ConnectionStatus: React.FC<{
  className?: string;
  showText?: boolean;
}> = ({ className, showText = true }) => {
  const { isOffline, isOnline } = useOffline();

  return (
    <div
      className={cn(
        'inline-flex items-center space-x-2',
        isOffline ? 'text-red-600' : 'text-green-600',
        className
      )}
    >
      <div className="relative">
        <div
          className={cn(
            'w-2 h-2 rounded-full',
            isOffline ? 'bg-red-600' : 'bg-green-600'
          )}
        />
        {isOnline && (
          <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-600 animate-ping" />
        )}
      </div>
      {showText && (
        <span className="text-xs font-medium">
          {isOffline ? 'Offline' : 'Online'}
        </span>
      )}
    </div>
  );
};