import React, { useState } from 'react';
import { EducationLevelSelector } from './EducationLevelSelector';
import type { EducationLevelName } from '../../types/education';

/**
 * Demo component to showcase the responsive design and styling improvements
 * for the education level selection feature.
 */
export const EducationLevelDemo: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<EducationLevelName | null>(null);

  const handleLevelSelect = (level: EducationLevelName) => {
    setSelectedLevel(level);
    console.log('Selected education level:', level);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Education Level Selection Demo
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Responsive design and accessibility improvements showcase
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Select Your Education Level
        </h2>
        
        <EducationLevelSelector
          selectedLevel={selectedLevel}
          onLevelSelect={handleLevelSelect}
        />

        {selectedLevel && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">
              Selected Level: {selectedLevel}
            </h3>
            <p className="text-green-700 text-sm">
              The selection is working correctly! Try selecting different levels to see the responsive behavior.
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Responsive Design Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mobile Optimizations:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Touch-optimized interaction states</li>
              <li>• Proper touch target sizes (min 44px)</li>
              <li>• Responsive text scaling</li>
              <li>• Mobile-first grid layout</li>
              <li>• Enhanced active states for feedback</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Accessibility Features:</h4>
            <ul className="space-y-1 text-gray-600">
              <li>• Full keyboard navigation support</li>
              <li>• Proper ARIA labels and states</li>
              <li>• Focus management and indicators</li>
              <li>• Screen reader compatibility</li>
              <li>• High contrast color schemes</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Testing Instructions
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Keyboard Navigation:</strong> Use Tab to navigate between cards, Enter/Space to select</p>
          <p><strong>Mobile Testing:</strong> Resize your browser window to see responsive behavior</p>
          <p><strong>Touch Testing:</strong> On touch devices, notice the enhanced feedback on tap</p>
          <p><strong>Accessibility:</strong> Test with screen readers for proper announcements</p>
        </div>
      </div>
    </div>
  );
};

export default EducationLevelDemo;