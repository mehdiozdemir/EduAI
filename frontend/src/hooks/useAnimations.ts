import { useEffect, useState } from 'react';

/**
 * Hook for fade-in animations
 */
export const useFadeIn = (delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return {
    isVisible,
    fadeInClass: isVisible 
      ? 'opacity-100 translate-y-0' 
      : 'opacity-0 translate-y-4'
  };
};

/**
 * Hook for intersection observer based animations
 */
export const useIntersectionAnimation = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [elementRef, setElementRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!elementRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(elementRef);

    return () => observer.disconnect();
  }, [elementRef, options]);

  return {
    isVisible,
    ref: setElementRef,
    animationClass: isVisible 
      ? 'opacity-100 translate-y-0 scale-100' 
      : 'opacity-0 translate-y-8 scale-95'
  };
};
