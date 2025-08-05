import React from 'react';
import { cn } from '../../utils';
import type { DifficultyLevelTurkish } from '../../types';

export interface DifficultySelectorProps {
  value: DifficultyLevelTurkish | '';
  onChange: (value: DifficultyLevelTurkish) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  helperText?: string;
  required?: boolean;
}

const DIFFICULTY_OPTIONS: Array<{
  value: DifficultyLevelTurkish;
  label: string;
  description: string;
  color: string;
}> = [
  {
    value: 'kolay',
    label: 'Kolay',
    description: 'Temel seviye sorular',
    color: 'text-green-600 border-green-200 bg-green-50 hover:bg-green-100 focus:ring-green-500'
  },
  {
    value: 'orta',
    label: 'Orta',
    description: 'Orta seviye sorular',
    color: 'text-yellow-600 border-yellow-200 bg-yellow-50 hover:bg-yellow-100 focus:ring-yellow-500'
  },
  {
    value: 'zor',
    label: 'Zor',
    description: 'İleri seviye sorular',
    color: 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100 focus:ring-red-500'
  }
];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  className,
  label = 'Zorluk Seviyesi',
  helperText = 'Quiz sorularının zorluk seviyesini seçin',
  required = false
}) => {
  const fieldsetId = `difficulty-selector-${Math.random().toString(36).substr(2, 9)}`;
  const hasError = Boolean(error);

  const handleChange = (selectedValue: DifficultyLevelTurkish) => {
    try {
      if (!disabled) {
        onChange(selectedValue);
      }
    } catch (error) {
      console.error('Error changing difficulty:', error);
      // Gracefully handle the error without breaking the UI
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, selectedValue: DifficultyLevelTurkish) => {
    try {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleChange(selectedValue);
      }
    } catch (error) {
      console.error('Error handling keydown:', error);
      // Gracefully handle the error without breaking the UI
    }
  };

  return (
    <fieldset 
      className={cn('w-full', className)}
      disabled={disabled}
      aria-describedby={error ? `${fieldsetId}-error` : helperText ? `${fieldsetId}-helper` : undefined}
    >
      {/* Label */}
      {label && (
        <legend className={cn(
          'block text-sm font-medium mb-3 transition-colors duration-200',
          hasError ? 'text-red-600' : 'text-gray-700',
          disabled && 'text-gray-400'
        )}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </legend>
      )}

      {/* Radio Button Options */}
      <div className="space-y-3" role="radiogroup" aria-labelledby={fieldsetId}>
        {DIFFICULTY_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const optionId = `${fieldsetId}-${option.value}`;

          return (
            <div key={option.value} className="relative">
              <label
                htmlFor={optionId}
                className={cn(
                  // Base styles
                  'flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
                  'hover:shadow-md focus-within:ring-2 focus-within:ring-offset-2',
                  'min-h-[60px] touch-manipulation',
                  // Selection state
                  isSelected
                    ? cn(
                        'border-current shadow-md',
                        option.color.includes('green') && 'border-green-500 bg-green-50',
                        option.color.includes('yellow') && 'border-yellow-500 bg-yellow-50',
                        option.color.includes('red') && 'border-red-500 bg-red-50'
                      )
                    : 'border-gray-200 bg-white hover:border-gray-300',
                  // Error state
                  hasError && !isSelected && 'border-red-300',
                  // Disabled state
                  disabled && 'cursor-not-allowed opacity-50 hover:shadow-none'
                )}
                onKeyDown={(e) => handleKeyDown(e, option.value)}
              >
                {/* Radio Button */}
                <input
                  type="radio"
                  id={optionId}
                  name={fieldsetId}
                  value={option.value}
                  checked={isSelected}
                  onChange={() => handleChange(option.value)}
                  disabled={disabled}
                  className="sr-only"
                  aria-describedby={`${optionId}-description`}
                  aria-label={`${option.label} - ${option.description}`}
                />

                {/* Custom Radio Indicator */}
                <div className={cn(
                  'flex-shrink-0 w-5 h-5 rounded-full border-2 mr-4 transition-colors duration-200',
                  'flex items-center justify-center',
                  isSelected
                    ? cn(
                        'border-current',
                        option.color.includes('green') && 'border-green-500 bg-green-500',
                        option.color.includes('yellow') && 'border-yellow-500 bg-yellow-500',
                        option.color.includes('red') && 'border-red-500 bg-red-500'
                      )
                    : hasError
                      ? 'border-red-400'
                      : 'border-gray-300',
                  disabled && 'border-gray-300'
                )}>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>

                {/* Option Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={cn(
                      'font-semibold text-base',
                      isSelected
                        ? cn(
                            option.color.includes('green') && 'text-green-900',
                            option.color.includes('yellow') && 'text-yellow-900',
                            option.color.includes('red') && 'text-red-900'
                          )
                        : hasError
                          ? 'text-red-700'
                          : 'text-gray-900',
                      disabled && 'text-gray-500'
                    )}>
                      {option.label}
                    </h3>

                    {/* Difficulty Badge */}
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      isSelected
                        ? cn(
                            option.color.includes('green') && 'bg-green-100 text-green-800',
                            option.color.includes('yellow') && 'bg-yellow-100 text-yellow-800',
                            option.color.includes('red') && 'bg-red-100 text-red-800'
                          )
                        : 'bg-gray-100 text-gray-600',
                      disabled && 'bg-gray-50 text-gray-400'
                    )}>
                      {option.label}
                    </span>
                  </div>

                  <p 
                    id={`${optionId}-description`}
                    className={cn(
                      'text-sm',
                      isSelected
                        ? cn(
                            option.color.includes('green') && 'text-green-700',
                            option.color.includes('yellow') && 'text-yellow-700',
                            option.color.includes('red') && 'text-red-700'
                          )
                        : hasError
                          ? 'text-red-600'
                          : 'text-gray-600',
                      disabled && 'text-gray-400'
                    )}
                  >
                    {option.description}
                  </p>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-2" id={`${fieldsetId}-error`}>
          <p className="text-sm text-red-600 flex items-center">
            <svg className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <div className="mt-2" id={`${fieldsetId}-helper`}>
          <p className={cn(
            'text-sm',
            disabled ? 'text-gray-400' : 'text-gray-600'
          )}>
            {helperText}
          </p>
        </div>
      )}
    </fieldset>
  );
};

export default DifficultySelector;