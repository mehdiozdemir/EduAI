import React from 'react';
import { cn } from '../../utils';

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

const ResponsiveGrid = React.forwardRef<HTMLDivElement, ResponsiveGridProps>(
  ({ className, cols = { default: 1, sm: 2, lg: 3 }, gap = 'md', children, ...props }, ref) => {
    const gapStyles = {
      sm: 'gap-3 sm:gap-4',
      md: 'gap-4 sm:gap-5 lg:gap-6',
      lg: 'gap-5 sm:gap-6 lg:gap-8',
      xl: 'gap-6 sm:gap-8 lg:gap-10',
    };

    const getGridCols = () => {
      const classes = [];
      
      if (cols.default) {
        classes.push(`grid-cols-${cols.default}`);
      }
      if (cols.sm) {
        classes.push(`sm:grid-cols-${cols.sm}`);
      }
      if (cols.md) {
        classes.push(`md:grid-cols-${cols.md}`);
      }
      if (cols.lg) {
        classes.push(`lg:grid-cols-${cols.lg}`);
      }
      if (cols.xl) {
        classes.push(`xl:grid-cols-${cols.xl}`);
      }
      
      return classes.join(' ');
    };

    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          getGridCols(),
          gapStyles[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ResponsiveGrid.displayName = 'ResponsiveGrid';

export default ResponsiveGrid;