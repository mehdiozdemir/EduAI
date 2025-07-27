import React from 'react';
import { cn } from '../../utils';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'white';
}

export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className, size = 'md', color = 'primary', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-8 w-8',
    };

    const colors = {
      primary: 'text-primary-600',
      secondary: 'text-secondary-600',
      white: 'text-white',
    };

    return (
      <div
        ref={ref}
        className={cn('animate-spin', sizes[size], colors[color], className)}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
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
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Loading = React.forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, text = 'Loading...', size = 'md', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center justify-center space-x-2', className)}
      data-testid="loading"
      {...props}
    >
      <Spinner size={size} />
      {text && <span className="text-gray-600">{text}</span>}
    </div>
  )
);

Loading.displayName = 'Loading';

// Skeleton components for loading states
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, width, height, rounded = false, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'animate-pulse bg-gray-200',
        rounded ? 'rounded-full' : 'rounded',
        className
      )}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  )
);

Skeleton.displayName = 'Skeleton';

export interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
  lastLineWidth?: string;
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  ({ className, lines = 3, lastLineWidth = '75%', ...props }, ref) => (
    <div ref={ref} className={cn('space-y-2', className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="1rem"
          width={index === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  )
);

SkeletonText.displayName = 'SkeletonText';

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showAvatar?: boolean;
}

export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, showAvatar = false, ...props }, ref) => (
    <div ref={ref} className={cn('p-4 space-y-4', className)} {...props}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <Skeleton width="2.5rem" height="2.5rem" rounded />
          <div className="space-y-2 flex-1">
            <Skeleton height="1rem" width="40%" />
            <Skeleton height="0.75rem" width="60%" />
          </div>
        </div>
      )}
      <div className="space-y-2">
        <Skeleton height="1.25rem" width="80%" />
        <SkeletonText lines={2} />
      </div>
    </div>
  )
);

SkeletonCard.displayName = 'SkeletonCard';