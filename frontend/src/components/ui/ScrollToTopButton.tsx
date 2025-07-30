import React, { useState, useEffect } from 'react';
import { useSmoothScroll } from '../../hooks/useScrollAnimations';
import { cn } from '../../utils';

interface ScrollToTopButtonProps {
  className?: string;
  showAfter?: number;
  size?: 'sm' | 'md' | 'lg';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  showProgress?: boolean;
  animated?: boolean;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  className = '',
  showAfter = 300,
  size = 'md',
  position = 'bottom-right',
  showProgress = true,
  animated = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { scrollToTop } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrolled / documentHeight) * 100;
      
      setIsVisible(scrolled > showAfter);
      setScrollProgress(Math.min(progress, 100));
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandle = () => {
      if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
        setTimeout(() => { ticking = false; }, 16);
      }
    };

    window.addEventListener('scroll', throttledHandle, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', throttledHandle);
  }, [showAfter]);

  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg'
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className={cn(
        'fixed z-50 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center group',
        'btn-enhanced focus-enhanced transition-all duration-300 transform hover:scale-110 active:scale-95',
        sizeClasses[size],
        positionClasses[position],
        'animate-fade-in-up',
        className
      )}
      aria-label="Sayfanın üstüne git"
      style={{
        background: showProgress 
          ? `conic-gradient(#3b82f6 ${scrollProgress * 3.6}deg, rgba(59, 130, 246, 0.2) 0deg)`
          : '#3b82f6'
      }}
    >
      {/* Inner circle for better visual separation when showing progress */}
      <div className={cn(
        'rounded-full flex items-center justify-center transition-colors bg-blue-600 group-hover:bg-blue-700',
        showProgress ? 'w-8 h-8 relative z-10' : 'w-full h-full'
      )}>
        <svg 
          className={cn(
            'transform group-hover:-translate-y-0.5 transition-transform duration-200',
            showProgress ? 'w-4 h-4' : 'w-1/2 h-1/2'
          )}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M5 10l7-7m0 0l7 7m-7-7v18" 
          />
        </svg>
      </div>
      
      {/* Ripple Effect */}
      {animated && (
        <div className="absolute inset-0 rounded-full bg-white opacity-0 group-active:opacity-20 transition-opacity duration-150" />
      )}
    </button>
  );
};

export default ScrollToTopButton;
