import React, { useState, useEffect } from 'react';
import { EducationLevelCard } from './EducationLevelCard';
import { educationService } from '../../services/educationService';
import type { EducationLevelData, EducationLevelName } from '../../types/education';

interface EducationLevelSelectorProps {
  selectedLevel: EducationLevelName | null;
  onLevelSelect: (level: EducationLevelName) => void;
  onEducationLevelsLoaded?: (levels: EducationLevelData[]) => void;
  className?: string;
}

// Education level configuration mapping API data to display data
const EDUCATION_LEVEL_CONFIG = {
  'ilkokul': {
    key: 'ilkokul' as EducationLevelName,
    title: 'İlkokul',
    description: '1-4. Sınıf'
  },
  'ortaokul': {
    key: 'ortaokul' as EducationLevelName,
    title: 'Ortaokul',
    description: '5-8. Sınıf'
  },
  'lise': {
    key: 'lise' as EducationLevelName,
    title: 'Lise',
    description: '9-12. Sınıf'
  }
} as const;

export const EducationLevelSelector: React.FC<EducationLevelSelectorProps> = ({
  selectedLevel,
  onLevelSelect,
  onEducationLevelsLoaded,
  className = ''
}) => {
  const [educationLevels, setEducationLevels] = useState<EducationLevelData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEducationLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        const levels = await educationService.getEducationLevels();
        setEducationLevels(levels);
        onEducationLevelsLoaded?.(levels);
      } catch (err) {
        console.error('Error fetching education levels:', err);
        setError('Eğitim seviyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducationLevels();
  }, [onEducationLevelsLoaded]);

  const handleLevelSelect = (level: EducationLevelName) => {
    onLevelSelect(level);
  };

  const handleRetry = () => {
    const fetchEducationLevels = async () => {
      try {
        setLoading(true);
        setError(null);
        const levels = await educationService.getEducationLevels();
        setEducationLevels(levels);
        onEducationLevelsLoaded?.(levels);
      } catch (err) {
        console.error('Error fetching education levels:', err);
        setError('Eğitim seviyeleri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchEducationLevels();
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-gray-100 animate-pulse rounded-lg p-4 sm:p-6 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center items-center border border-gray-200"
            >
              <div className="space-y-2 text-center w-full">
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-800 mb-2">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-700 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Map API data to display configuration
  const displayLevels = educationLevels
    .map(level => {
      const config = EDUCATION_LEVEL_CONFIG[level.name as keyof typeof EDUCATION_LEVEL_CONFIG];
      if (!config) return null;
      
      return {
        ...level,
        key: config.key,
        displayTitle: config.title,
        displayDescription: level.grade_range || config.description
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.sort_order - b!.sort_order);

  if (displayLevels.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <div className="text-yellow-800 mb-2">
            <svg className="w-6 h-6 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-yellow-700">Henüz eğitim seviyesi bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {displayLevels.map((level) => (
          <EducationLevelCard
            key={level!.id}
            level={level!.key}
            title={level!.displayTitle}
            description={level!.displayDescription}
            isSelected={selectedLevel === level!.key}
            onClick={handleLevelSelect}
          />
        ))}
      </div>
    </div>
  );
};

export default EducationLevelSelector;