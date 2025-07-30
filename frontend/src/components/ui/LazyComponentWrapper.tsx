import React, { Suspense, type ReactNode } from 'react';
import { SectionSkeleton } from './Skeleton';

interface LazyComponentWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  sectionType?: 'features' | 'testimonials' | 'stats' | 'hero' | 'default';
}

export const LazyComponentWrapper: React.FC<LazyComponentWrapperProps> = ({
  children,
  fallback,
  className = '',
  sectionType = 'default'
}) => {
  const getDefaultFallback = () => {
    switch (sectionType) {
      case 'features':
        return <SectionSkeleton title cards={4} layout="grid" className={className} />;
      case 'testimonials':
        return <SectionSkeleton title cards={3} layout="grid" className={className} />;
      case 'stats':
        return <SectionSkeleton title cards={4} layout="grid" className={className} />;
      case 'hero':
        return <SectionSkeleton title={false} cards={0} className={`py-20 ${className}`} />;
      default:
        return <SectionSkeleton className={className} />;
    }
  };

  return (
    <Suspense fallback={fallback || getDefaultFallback()}>
      {children}
    </Suspense>
  );
};

export default LazyComponentWrapper;
