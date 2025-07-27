import React from 'react';
import { cn } from '../../utils';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stickyHeader?: boolean;
}

export interface ResponsiveTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface ResponsiveTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
}

export interface ResponsiveTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
}

export interface ResponsiveTableCellProps extends React.HTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  header?: boolean;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

const ResponsiveTable = React.forwardRef<HTMLDivElement, ResponsiveTableProps>(
  ({ className, children, stickyHeader = false, ...props }, ref) => {
    const { isMobile } = useBreakpoint();

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-x-auto -mx-4 sm:mx-0',
          isMobile && 'scrollbar-hide',
          className
        )}
        {...props}
      >
        <table
          className={cn(
            'min-w-full divide-y divide-gray-200',
            isMobile && 'text-sm'
          )}
        >
          {children}
        </table>
      </div>
    );
  }
);

ResponsiveTable.displayName = 'ResponsiveTable';

const ResponsiveTableHeader = React.forwardRef<HTMLTableSectionElement, ResponsiveTableHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={cn('bg-gray-50 sticky top-0 z-10', className)}
        {...props}
      >
        {children}
      </thead>
    );
  }
);

ResponsiveTableHeader.displayName = 'ResponsiveTableHeader';

const ResponsiveTableBody = React.forwardRef<HTMLTableSectionElement, ResponsiveTableBodyProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={cn('bg-white divide-y divide-gray-200', className)}
        {...props}
      >
        {children}
      </tbody>
    );
  }
);

ResponsiveTableBody.displayName = 'ResponsiveTableBody';

const ResponsiveTableRow = React.forwardRef<HTMLTableRowElement, ResponsiveTableRowProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn('hover:bg-gray-50 transition-colors', className)}
        {...props}
      >
        {children}
      </tr>
    );
  }
);

ResponsiveTableRow.displayName = 'ResponsiveTableRow';

const ResponsiveTableCell = React.forwardRef<HTMLTableCellElement, ResponsiveTableCellProps>(
  ({ className, children, header = false, mobileLabel, hideOnMobile = false, ...props }, ref) => {
    const { isMobile } = useBreakpoint();
    const Component = header ? 'th' : 'td';

    if (hideOnMobile && isMobile) {
      return null;
    }

    return (
      <Component
        ref={ref}
        className={cn(
          header
            ? 'px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sm:px-6'
            : 'px-3 py-4 text-sm text-gray-900 sm:px-6',
          isMobile && !header && mobileLabel && 'relative pl-20',
          className
        )}
        {...props}
      >
        {isMobile && !header && mobileLabel && (
          <span className="absolute left-3 top-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
            {mobileLabel}:
          </span>
        )}
        <div className={cn(isMobile && !header && mobileLabel && 'ml-0')}>
          {children}
        </div>
      </Component>
    );
  }
);

ResponsiveTableCell.displayName = 'ResponsiveTableCell';

export {
  ResponsiveTable,
  ResponsiveTableHeader,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell,
};