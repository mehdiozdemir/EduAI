import React from 'react';
import { cn } from '../../utils';
import { Skeleton, SkeletonText } from './Loading';

// Dashboard skeleton
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="2rem" width="200px" />
        <Skeleton height="1rem" width="300px" />
      </div>
      <Skeleton height="2.5rem" width="120px" />
    </div>

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <Skeleton height="1rem" width="80px" />
            <Skeleton height="1.5rem" width="1.5rem" rounded />
          </div>
          <Skeleton height="2rem" width="60px" />
          <Skeleton height="0.75rem" width="100px" className="mt-1" />
        </div>
      ))}
    </div>

    {/* Chart skeleton */}
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <Skeleton height="1.5rem" width="150px" />
        <Skeleton height="2rem" width="100px" />
      </div>
      <div className="h-64 flex items-end justify-between space-x-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton
            key={index}
            width="100%"
            height={`${Math.random() * 80 + 20}%`}
          />
        ))}
      </div>
    </div>

    {/* Recent activity skeleton */}
    <div className="bg-white p-6 rounded-lg border">
      <Skeleton height="1.5rem" width="120px" className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton height="2.5rem" width="2.5rem" rounded />
            <div className="flex-1 space-y-1">
              <Skeleton height="1rem" width="70%" />
              <Skeleton height="0.75rem" width="40%" />
            </div>
            <Skeleton height="0.75rem" width="60px" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Subject list skeleton
export const SubjectListSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <div className="flex items-center justify-between">
      <Skeleton height="2rem" width="150px" />
      <Skeleton height="2.5rem" width="100px" />
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border">
          <div className="flex items-center space-x-3 mb-4">
            <Skeleton height="3rem" width="3rem" rounded />
            <div className="flex-1">
              <Skeleton height="1.25rem" width="80%" />
              <Skeleton height="0.875rem" width="60%" className="mt-1" />
            </div>
          </div>
          <SkeletonText lines={2} />
          <div className="flex items-center justify-between mt-4">
            <Skeleton height="0.75rem" width="80px" />
            <Skeleton height="2rem" width="80px" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Topic list skeleton
export const TopicListSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-4', className)}>
    <div className="flex items-center space-x-2 mb-6">
      <Skeleton height="1rem" width="60px" />
      <span className="text-gray-400">/</span>
      <Skeleton height="1rem" width="100px" />
    </div>

    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton height="1.125rem" width="70%" />
              <Skeleton height="0.875rem" width="90%" className="mt-2" />
            </div>
            <div className="ml-4 flex items-center space-x-2">
              <Skeleton height="1.5rem" width="40px" />
              <Skeleton height="2rem" width="80px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Quiz session skeleton
export const QuizSessionSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('max-w-4xl mx-auto space-y-6', className)}>
    {/* Progress bar skeleton */}
    <div className="bg-white p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-2">
        <Skeleton height="0.875rem" width="100px" />
        <Skeleton height="0.875rem" width="60px" />
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <Skeleton height="0.5rem" width="30%" />
      </div>
    </div>

    {/* Question card skeleton */}
    <div className="bg-white p-6 rounded-lg border">
      <div className="mb-6">
        <Skeleton height="1rem" width="80px" className="mb-2" />
        <SkeletonText lines={3} />
      </div>

      {/* Answer options skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="p-3 border rounded-lg">
            <Skeleton height="1rem" width="85%" />
          </div>
        ))}
      </div>

      {/* Action buttons skeleton */}
      <div className="flex justify-between mt-6">
        <Skeleton height="2.5rem" width="80px" />
        <Skeleton height="2.5rem" width="100px" />
      </div>
    </div>
  </div>
);

// Performance analysis skeleton
export const PerformanceAnalysisSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton height="2rem" width="250px" />
        <Skeleton height="1rem" width="180px" />
      </div>
      <Skeleton height="2.5rem" width="120px" />
    </div>

    {/* Performance metrics */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border text-center">
          <Skeleton height="3rem" width="3rem" rounded className="mx-auto mb-3" />
          <Skeleton height="2rem" width="80px" className="mx-auto mb-2" />
          <Skeleton height="1rem" width="100px" className="mx-auto" />
        </div>
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-lg border">
        <Skeleton height="1.5rem" width="150px" className="mb-4" />
        <div className="h-64 flex items-center justify-center">
          <Skeleton height="200px" width="200px" rounded />
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border">
        <Skeleton height="1.5rem" width="180px" className="mb-4" />
        <div className="h-64 flex items-end justify-between space-x-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton
              key={index}
              width="100%"
              height={`${Math.random() * 80 + 20}%`}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Performance history */}
    <div className="bg-white p-6 rounded-lg border">
      <Skeleton height="1.5rem" width="180px" className="mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded">
            <div className="flex items-center space-x-3">
              <Skeleton height="2rem" width="2rem" rounded />
              <div className="space-y-1">
                <Skeleton height="1rem" width="120px" />
                <Skeleton height="0.75rem" width="80px" />
              </div>
            </div>
            <div className="text-right space-y-1">
              <Skeleton height="1rem" width="60px" />
              <Skeleton height="0.75rem" width="80px" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Recommendations skeleton
export const RecommendationsSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <div className="flex items-center justify-between">
      <Skeleton height="1.5rem" width="200px" />
      <Skeleton height="2rem" width="100px" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border">
          <div className="flex items-start space-x-3">
            <Skeleton height="2.5rem" width="2.5rem" rounded />
            <div className="flex-1 space-y-2">
              <Skeleton height="1rem" width="90%" />
              <Skeleton height="0.75rem" width="70%" />
              <SkeletonText lines={2} lastLineWidth="60%" />
              <div className="flex items-center justify-between mt-3">
                <Skeleton height="0.75rem" width="60px" />
                <Skeleton height="1.5rem" width="80px" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 3, 
  className 
}) => (
  <div className={cn('space-y-4', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton height="1rem" width="100px" />
        <Skeleton height="2.5rem" width="100%" />
      </div>
    ))}
    <div className="flex justify-end space-x-2 pt-4">
      <Skeleton height="2.5rem" width="80px" />
      <Skeleton height="2.5rem" width="100px" />
    </div>
  </div>
);

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number; 
  className?: string;
}> = ({ rows = 5, columns = 4, className }) => (
  <div className={cn('bg-white rounded-lg border overflow-hidden', className)}>
    {/* Table header */}
    <div className="border-b bg-gray-50 p-4">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} height="1rem" width="80%" />
        ))}
      </div>
    </div>
    
    {/* Table rows */}
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="1rem" width="90%" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);