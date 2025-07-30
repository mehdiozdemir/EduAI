import React from 'react';
import { useScrollProgress } from '../../hooks/useScrollAnimations';

interface ScrollProgressIndicatorProps {
  className?: string;
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
  showGlow?: boolean;
  animated?: boolean;
}

export const ScrollProgressIndicator: React.FC<ScrollProgressIndicatorProps> = ({
  className = '',
  color = 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  height = 3,
  position = 'top',
  showGlow = true,
  animated = true
}) => {
  const scrollProgress = useScrollProgress();

  return (
    <div 
      className={`fixed left-0 right-0 z-50 ${position === 'top' ? 'top-0' : 'bottom-0'} ${className}`}
      style={{ height: `${height}px` }}
    >
      {/* Background Track */}
      <div className="absolute inset-0 bg-gray-200/20 backdrop-blur-sm" />
      
      {/* Progress Bar */}
      <div 
        className={`h-full ${color} ${
          animated ? 'transition-all duration-200 ease-out' : ''
        } relative overflow-hidden`}
        style={{ 
          width: `${scrollProgress}%`,
          transformOrigin: 'left center',
          boxShadow: showGlow && scrollProgress > 0 
            ? '0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)' 
            : 'none'
        }}
      >
        {/* Shine Effect */}
        {animated && scrollProgress > 0 && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-pulse" />
        )}
      </div>
    </div>
  );
};

export default ScrollProgressIndicator;
