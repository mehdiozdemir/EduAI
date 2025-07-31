import React from 'react';
import Card from '../ui/Card';
import { cn } from '../../utils';
import type { EducationLevelName } from '../../types/education';

interface EducationLevelCardProps {
  level: EducationLevelName;
  title: string;
  description?: string;
  isSelected: boolean;
  onClick: (level: EducationLevelName) => void;
}

export const EducationLevelCard: React.FC<EducationLevelCardProps> = ({
  level,
  title,
  description,
  isSelected,
  onClick,
}) => {
  const handleClick = () => {
    onClick(level);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(level);
    }
  };

  return (
    <Card
      className={cn(
        // Base layout and sizing
        'p-4 sm:p-6 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center items-center text-center',
        // Interactive states and transitions
        'transition-all duration-200 cursor-pointer touch-manipulation',
        // Hover effects - enhanced for better visual feedback
        'hover:shadow-lg hover:bg-gray-50 hover:border-gray-300 hover:scale-[1.02]',
        // Active state for better mobile feedback
        'active:shadow-md active:scale-[0.98] active:bg-gray-100',
        // Focus styles for accessibility
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // Selected state styling
        isSelected
          ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-200'
          : 'bg-white border-gray-200',
        // Mobile-specific improvements
        'select-none', // Prevent text selection on mobile
        // Enhanced mobile touch target
        'min-w-0 w-full' // Ensure full width on mobile
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`${title} eğitim seviyesini seç${description ? ` - ${description}` : ''}`}
    >
      <div className="space-y-2 w-full">
        <h3 className={cn(
          'text-lg sm:text-xl font-semibold leading-tight',
          // Better text scaling for mobile
          'text-base xs:text-lg sm:text-xl',
          // Enhanced color contrast
          isSelected ? 'text-blue-900' : 'text-gray-900'
        )}>
          {title}
        </h3>
        {description && (
          <p className={cn(
            'text-sm sm:text-base leading-relaxed',
            // Better mobile text sizing
            'text-xs xs:text-sm sm:text-base',
            // Enhanced color contrast
            isSelected ? 'text-blue-700' : 'text-gray-600'
          )}>
            {description}
          </p>
        )}
      </div>
    </Card>
  );
};

export default EducationLevelCard;