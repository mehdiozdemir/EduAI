import React from 'react';
import { cn } from '../../utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
  lines = 1,
  animation = 'pulse'
}) => {
  const baseSkeletonClass = cn(
    'bg-gray-200',
    {
      'animate-pulse': animation === 'pulse',
      'animate-wave': animation === 'wave',
    }
  );

  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
        return 'rounded-none';
      default:
        return 'rounded';
    }
  };

  const skeletonStyle = {
    width: width || (variant === 'text' ? '100%' : undefined),
    height: height || (variant === 'text' ? '1em' : undefined),
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={className}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseSkeletonClass,
              getVariantClasses(),
              'mb-2 last:mb-0',
              index === lines - 1 && lines > 1 && 'w-3/4' // Last line shorter
            )}
            style={{
              ...skeletonStyle,
              height: height || '1em'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        baseSkeletonClass,
        getVariantClasses(),
        className
      )}
      style={skeletonStyle}
    />
  );
};

// Specialized skeleton components
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-lg shadow-sm border', className)}>
    <Skeleton variant="rectangular" height="200px" className="mb-4" />
    <Skeleton variant="text" height="24px" className="mb-2" />
    <Skeleton variant="text" lines={3} height="16px" />
  </div>
);

export const FeatureCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-lg shadow-sm border', className)}>
    <Skeleton variant="circular" width="48px" height="48px" className="mb-4" />
    <Skeleton variant="text" height="20px" width="60%" className="mb-2" />
    <Skeleton variant="text" lines={2} height="14px" />
  </div>
);

export const TestimonialSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-6 bg-white rounded-lg shadow-sm', className)}>
    <div className="flex items-center mb-4">
      <Skeleton variant="circular" width="48px" height="48px" className="mr-4" />
      <div className="flex-1">
        <Skeleton variant="text" height="16px" width="40%" className="mb-1" />
        <Skeleton variant="text" height="12px" width="60%" />
      </div>
    </div>
    <Skeleton variant="text" lines={3} height="14px" />
  </div>
);

export const StatSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('text-center p-6 bg-blue-600 rounded-lg text-white', className)}>
    <Skeleton variant="text" height="48px" width="80%" className="mb-2 bg-white/20" />
    <Skeleton variant="text" height="16px" width="60%" className="bg-white/10" />
  </div>
);

export const HeaderSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center justify-between p-4 bg-white shadow-sm', className)}>
    <Skeleton variant="text" height="32px" width="120px" />
    <div className="hidden md:flex space-x-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} variant="text" height="16px" width="80px" />
      ))}
    </div>
    <div className="flex space-x-2">
      <Skeleton variant="rounded" height="36px" width="80px" />
      <Skeleton variant="rounded" height="36px" width="100px" />
    </div>
  </div>
);

export const HeroSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('py-20 px-4', className)}>
    <div className="max-w-4xl mx-auto text-center">
      <Skeleton variant="text" height="48px" width="80%" className="mb-4 mx-auto" />
      <Skeleton variant="text" height="48px" width="60%" className="mb-6 mx-auto" />
      <Skeleton variant="text" lines={2} height="18px" width="70%" className="mb-8 mx-auto" />
      <div className="flex justify-center space-x-4">
        <Skeleton variant="rounded" height="48px" width="140px" />
        <Skeleton variant="rounded" height="48px" width="120px" />
      </div>
    </div>
  </div>
);

// Loading states for entire sections
export const SectionSkeleton: React.FC<{ 
  title?: boolean;
  cards?: number;
  layout?: 'grid' | 'list';
  className?: string;
}> = ({ 
  title = true, 
  cards = 4, 
  layout = 'grid',
  className 
}) => (
  <div className={cn('py-16 px-4', className)}>
    <div className="max-w-7xl mx-auto">
      {title && (
        <div className="text-center mb-12">
          <Skeleton variant="text" height="36px" width="40%" className="mb-4 mx-auto" />
          <Skeleton variant="text" lines={2} height="16px" width="60%" className="mx-auto" />
        </div>
      )}
      
      <div className={cn(
        layout === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
          : 'space-y-6'
      )}>
        {Array.from({ length: cards }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

export default Skeleton;
