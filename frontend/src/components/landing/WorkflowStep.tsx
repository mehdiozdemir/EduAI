import React from 'react';
import { cn } from '../../utils';

export interface WorkflowStep {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

interface WorkflowStepProps {
  step: WorkflowStep;
  isLast?: boolean;
  className?: string;
  animationDelay?: number;
}

const colorStyles = {
  blue: {
    numberBg: 'bg-blue-600',
    numberText: 'text-white',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    line: 'bg-blue-200',
  },
  green: {
    numberBg: 'bg-green-600',
    numberText: 'text-white',
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    line: 'bg-green-200',
  },
  purple: {
    numberBg: 'bg-purple-600',
    numberText: 'text-white',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    line: 'bg-purple-200',
  },
  orange: {
    numberBg: 'bg-orange-600',
    numberText: 'text-white',
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    line: 'bg-orange-200',
  },
};

const WorkflowStepComponent: React.FC<WorkflowStepProps> = ({ 
  step, 
  isLast = false,
  className,
  animationDelay = 0 
}) => {
  const colorStyle = colorStyles[step.color || 'blue'];

  return (
    <div 
      className={cn(
        'relative flex flex-col items-center text-center',
        'lg:flex-row lg:text-left lg:items-start',
        'group',
        className
      )}
    >
      {/* Mobile/Tablet Timeline - Vertical Line */}
      {!isLast && (
        <div className={cn(
          'absolute top-16 left-1/2 transform -translate-x-1/2 w-px h-16',
          'lg:hidden transition-all duration-500',
          'opacity-30 group-hover:opacity-100',
          colorStyle.line
        )} />
      )}

      {/* Desktop Timeline - Horizontal Line */}
      {!isLast && (
        <div className={cn(
          'hidden lg:block absolute top-8 left-full w-full h-px',
          'transform translate-x-4 transition-all duration-500',
          'opacity-30 group-hover:opacity-100',
          colorStyle.line
        )} />
      )}

      {/* Step Content Container */}
      <div className="relative flex flex-col items-center lg:items-start lg:flex-row lg:space-x-4 mb-8 lg:mb-0">
        
        {/* Step Number Circle */}
        <div className={cn(
          'flex items-center justify-center w-16 h-16 rounded-full',
          'font-bold text-lg z-10 mb-4 lg:mb-0 flex-shrink-0',
          'shadow-lg transition-all duration-300',
          'hover:scale-110 hover:shadow-xl group-hover:animate-pulse',
          colorStyle.numberBg,
          colorStyle.numberText
        )}>
          {step.number}
        </div>

        {/* Step Content */}
        <div className="flex-1 max-w-xs lg:max-w-none">
          {/* Icon */}
          <div className={cn(
            'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3',
            'lg:mb-4 transition-all duration-300',
            'group-hover:scale-110 group-hover:shadow-md',
            colorStyle.iconBg
          )}>
            <div className={cn(
              'w-6 h-6 transition-all duration-300',
              'group-hover:scale-110',
              colorStyle.iconColor
            )}>
              {step.icon}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 mb-2 lg:mb-3 transition-colors duration-300 group-hover:text-gray-700">
            {step.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed transition-colors duration-300 group-hover:text-gray-700">
            {step.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkflowStepComponent;
