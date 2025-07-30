import React from 'react';
import { cn } from '../../utils';

interface EnhancedLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton' | 'wave';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'purple' | 'pink' | 'green' | 'gray';
  className?: string;
  text?: string;
  overlay?: boolean;
}

const colorClasses = {
  blue: 'text-blue-600 border-blue-600',
  purple: 'text-purple-600 border-purple-600',
  pink: 'text-pink-600 border-pink-600',
  green: 'text-green-600 border-green-600',
  gray: 'text-gray-600 border-gray-600'
};

const sizeClasses = {
  spinner: {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  },
  dots: {
    sm: 'w-1 h-1',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
    xl: 'w-4 h-4'
  }
};

export const EnhancedLoading: React.FC<EnhancedLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  color = 'blue',
  className,
  text,
  overlay = false
}) => {
  const colorClass = colorClasses[color];

  const renderSpinner = () => (
    <div
      className={cn(
        'spinner-enhanced rounded-full border-solid animate-spin',
        'border-current border-opacity-20 border-t-current',
        sizeClasses.spinner[size],
        colorClass,
        className
      )}
    />
  );

  const renderDots = () => (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'rounded-full bg-current animate-pulse',
            sizeClasses.dots[size],
            colorClass
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={cn(
        'rounded-full bg-current pulse-enhanced',
        sizeClasses.dots[size],
        colorClass,
        className
      )}
    />
  );

  const renderSkeleton = () => (
    <div className={cn('space-y-3', className)}>
      <div className="skeleton-enhanced h-4 rounded w-3/4" />
      <div className="skeleton-enhanced h-4 rounded w-1/2" />
      <div className="skeleton-enhanced h-4 rounded w-5/6" />
    </div>
  );

  const renderWave = () => (
    <div className={cn('flex items-end space-x-1', className)}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-current rounded-sm',
            sizeClasses.dots[size],
            colorClass
          )}
          style={{
            height: `${Math.random() * 20 + 10}px`,
            animationDelay: `${i * 0.1}s`,
            animation: 'wave 0.8s ease-in-out infinite alternate'
          }}
        />
      ))}
    </div>
  );

  const renderContent = () => {
    let content;
    
    switch (variant) {
      case 'dots':
        content = renderDots();
        break;
      case 'pulse':
        content = renderPulse();
        break;
      case 'skeleton':
        content = renderSkeleton();
        break;
      case 'wave':
        content = renderWave();
        break;
      default:
        content = renderSpinner();
    }

    return (
      <div className="flex flex-col items-center space-y-2">
        {content}
        {text && (
          <p className={cn('text-sm font-medium animate-pulse', colorClass)}>
            {text}
          </p>
        )}
      </div>
    );
  };

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};

// Add wave animation to CSS
const waveKeyframes = `
  @keyframes wave {
    0% { transform: scaleY(0.4); }
    100% { transform: scaleY(1); }
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('wave-animation')) {
  const style = document.createElement('style');
  style.id = 'wave-animation';
  style.textContent = waveKeyframes;
  document.head.appendChild(style);
}

export default EnhancedLoading;
