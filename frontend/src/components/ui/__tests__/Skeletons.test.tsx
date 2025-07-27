import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  DashboardSkeleton,
  SubjectListSkeleton,
  TopicListSkeleton,
  QuizSessionSkeleton,
  PerformanceAnalysisSkeleton,
  RecommendationsSkeleton,
  FormSkeleton,
  TableSkeleton,
} from '../Skeletons';

describe('Skeleton Components', () => {
  describe('DashboardSkeleton', () => {
    it('renders dashboard skeleton structure', () => {
      render(<DashboardSkeleton />);
      
      // Should have multiple skeleton elements
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('applies custom className', () => {
      const { container } = render(<DashboardSkeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('SubjectListSkeleton', () => {
    it('renders subject list skeleton structure', () => {
      render(<SubjectListSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders grid layout for subjects', () => {
      const { container } = render(<SubjectListSkeleton />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('TopicListSkeleton', () => {
    it('renders topic list skeleton structure', () => {
      render(<TopicListSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders breadcrumb skeleton', () => {
      const { container } = render(<TopicListSkeleton />);
      // Should have breadcrumb-like structure
      expect(container.querySelector('.space-y-4')).toBeInTheDocument();
    });
  });

  describe('QuizSessionSkeleton', () => {
    it('renders quiz session skeleton structure', () => {
      render(<QuizSessionSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders progress bar skeleton', () => {
      const { container } = render(<QuizSessionSkeleton />);
      const progressContainer = container.querySelector('.bg-gray-200.rounded-full');
      expect(progressContainer).toBeInTheDocument();
    });
  });

  describe('PerformanceAnalysisSkeleton', () => {
    it('renders performance analysis skeleton structure', () => {
      render(<PerformanceAnalysisSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders chart skeletons', () => {
      const { container } = render(<PerformanceAnalysisSkeleton />);
      const chartContainers = container.querySelectorAll('.h-64');
      expect(chartContainers.length).toBeGreaterThan(0);
    });
  });

  describe('RecommendationsSkeleton', () => {
    it('renders recommendations skeleton structure', () => {
      render(<RecommendationsSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders grid layout for recommendations', () => {
      const { container } = render(<RecommendationsSkeleton />);
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe('FormSkeleton', () => {
    it('renders form skeleton with default fields', () => {
      render(<FormSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders custom number of fields', () => {
      const { container } = render(<FormSkeleton fields={5} />);
      const fieldContainers = container.querySelectorAll('.space-y-2');
      expect(fieldContainers.length).toBeGreaterThan(0);
    });

    it('renders action buttons skeleton', () => {
      const { container } = render(<FormSkeleton />);
      const buttonContainer = container.querySelector('.flex.justify-end');
      expect(buttonContainer).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('renders table skeleton with default rows and columns', () => {
      render(<TableSkeleton />);
      
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders custom number of rows and columns', () => {
      const { container } = render(<TableSkeleton rows={3} columns={2} />);
      const tableContainer = container.querySelector('.bg-white.rounded-lg.border');
      expect(tableContainer).toBeInTheDocument();
    });

    it('renders table header', () => {
      const { container } = render(<TableSkeleton />);
      const headerContainer = container.querySelector('.border-b.bg-gray-50');
      expect(headerContainer).toBeInTheDocument();
    });

    it('renders table rows with dividers', () => {
      const { container } = render(<TableSkeleton />);
      const rowsContainer = container.querySelector('.divide-y');
      expect(rowsContainer).toBeInTheDocument();
    });
  });

  describe('Skeleton Accessibility', () => {
    it('all skeletons have proper ARIA attributes', () => {
      render(
        <div>
          <DashboardSkeleton />
          <SubjectListSkeleton />
          <TopicListSkeleton />
          <QuizSessionSkeleton />
          <PerformanceAnalysisSkeleton />
          <RecommendationsSkeleton />
          <FormSkeleton />
          <TableSkeleton />
        </div>
      );

      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThan(0);
      
      // All skeletons should have the presentation role
      skeletons.forEach(skeleton => {
        expect(skeleton).toHaveAttribute('role', 'presentation');
      });
    });
  });

  describe('Skeleton Animation', () => {
    it('skeletons have pulse animation class', () => {
      const { container } = render(<DashboardSkeleton />);
      const animatedElements = container.querySelectorAll('.animate-pulse');
      expect(animatedElements.length).toBeGreaterThan(0);
    });
  });
});