import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Subject } from '../../types';

interface SubjectCardProps {
  subject: Subject;
  onClick: (subjectId: number) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  const handleClick = () => {
    onClick(subject.id);
  };

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg active:shadow-md transition-all duration-200 cursor-pointer touch-manipulation min-h-[140px] sm:min-h-[160px] flex flex-col" onClick={handleClick}>
      <div className="flex-1 space-y-3 sm:space-y-4">
        <div className="flex-1">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
            {subject.name}
          </h3>
          <p className="text-gray-600 text-sm sm:text-base line-clamp-3 leading-relaxed">
            {subject.description}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 pt-2 border-t border-gray-100">
          <div className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
            {new Date(subject.created_at).toLocaleDateString('tr-TR')}
          </div>
          <Button 
            variant="primary" 
            size="sm"
            className="order-1 sm:order-2 w-full sm:w-auto min-h-[40px] sm:min-h-[36px]"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Konuları Gör
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default SubjectCard;