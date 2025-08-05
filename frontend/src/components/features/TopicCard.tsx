import React from 'react';
import { cn } from '../../utils';
import type { CourseTopic } from '../../types';

export interface TopicCardProps {
  topic: CourseTopic;
  isSelected: boolean;
  onToggle: (topic: CourseTopic) => void;
  className?: string;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  isSelected,
  onToggle,
  className
}) => {
  const handleClick = () => {
    try {
      onToggle(topic);
    } catch (error) {
      console.error('Error toggling topic:', error);
      // Gracefully handle the error without breaking the UI
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    try {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onToggle(topic);
      }
    } catch (error) {
      console.error('Error handling keydown:', error);
      // Gracefully handle the error without breaking the UI
    }
  };

  // Map difficulty level to Turkish labels and colors
  const getDifficultyInfo = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'Kolay', color: 'bg-green-100 text-green-800' };
      case 2:
        return { label: 'Orta', color: 'bg-yellow-100 text-yellow-800' };
      case 3:
        return { label: 'Zor', color: 'bg-red-100 text-red-800' };
      default:
        return { label: 'Bilinmiyor', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const difficultyInfo = getDifficultyInfo(topic.difficulty_level);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        // Base styles
        'bg-white rounded-lg border-2 p-4 cursor-pointer transition-all duration-200',
        'hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        'min-h-[120px] flex flex-col justify-between',
        // Touch-friendly sizing
        'min-h-[44px] touch-manipulation',
        // Selection state styles
        isSelected
          ? 'border-primary-500 bg-primary-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300',
        className
      )}
      aria-pressed={isSelected}
      aria-label={`${topic.name} konusu${isSelected ? ', seçili' : ', seçili değil'}. ${difficultyInfo.label} seviye.${topic.description ? ` ${topic.description}` : ''}`}
    >
      {/* Topic Header */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className={cn(
            'font-semibold text-sm sm:text-base leading-tight',
            isSelected ? 'text-primary-900' : 'text-gray-900'
          )}>
            {topic.name}
          </h3>
          
          {/* Selection indicator */}
          <div className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 ml-2 transition-colors',
            isSelected
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300'
          )}>
            {isSelected && (
              <svg
                className="w-3 h-3 text-white m-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Topic Description */}
        {topic.description && (
          <p className={cn(
            'text-xs sm:text-sm line-clamp-2 mb-3',
            isSelected ? 'text-primary-700' : 'text-gray-600'
          )}>
            {topic.description}
          </p>
        )}
      </div>

      {/* Topic Footer */}
      <div className="flex items-center justify-between mt-auto">
        {/* Difficulty Badge */}
        <span className={cn(
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
          difficultyInfo.color
        )}>
          {difficultyInfo.label}
        </span>

        {/* Duration if available */}
        {topic.estimated_duration && (
          <span className={cn(
            'text-xs',
            isSelected ? 'text-primary-600' : 'text-gray-500'
          )}>
            ~{topic.estimated_duration} dk
          </span>
        )}
      </div>
    </div>
  );
};

export default TopicCard;