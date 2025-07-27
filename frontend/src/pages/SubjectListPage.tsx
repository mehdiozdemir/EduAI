import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard } from '../components/features/SubjectCard';
import { useLoadingState, LoadingWrapper } from '../components/ui/LoadingStateManager';
import { useErrorHandler, ErrorBoundarySection } from '../components/ui/ErrorBoundaryProvider';
import { RetryHandler, RetryUI } from '../components/ui/RetryHandler';
import { EmptyStateFallback } from '../components/ui/ErrorFallbacks';
import { subjectService } from '../services/subjectService';
import type { Subject } from '../types';

export const SubjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { setLoading, isLoading } = useLoadingState();
  const { handleError } = useErrorHandler();
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const loadSubjects = async () => {
    const data = await subjectService.getSubjects();
    setSubjects(data);
  };

  useEffect(() => {
    setLoading('subjects', true);
    loadSubjects()
      .catch(handleError)
      .finally(() => setLoading('subjects', false));
  }, []);

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  const loading = isLoading('subjects');

  return (
    <LoadingWrapper loadingKey="subjects" skeleton="subjects">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dersler</h1>
          <p className="text-gray-600 text-sm sm:text-base">Çalışmak istediğiniz dersi seçin</p>
        </div>
        
        <RetryHandler
          operation={loadSubjects}
          onError={handleError}
          maxAttempts={3}
        >
          {({ retry, isRetrying, lastError, canRetry }) => (
            <>
              {lastError && (
                <div className="mb-6">
                  <RetryUI
                    error={lastError}
                    onRetry={retry}
                    isRetrying={isRetrying}
                    attempt={1}
                    maxAttempts={3}
                    canRetry={canRetry}
                    title="Failed to Load Subjects"
                    description="Unable to fetch subjects. Please try again."
                  />
                </div>
              )}
              
              {!lastError && subjects.length === 0 && !loading && (
                <EmptyStateFallback
                  title="No Subjects Available"
                  description="No subjects have been added to the system yet."
                  icon={
                    <svg 
                      className="w-8 h-8 text-gray-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                      />
                    </svg>
                  }
                />
              )}
              
              {subjects.length > 0 && (
                <ErrorBoundarySection>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {subjects.map((subject) => (
                      <SubjectCard
                        key={subject.id}
                        subject={subject}
                        onClick={handleSubjectClick}
                      />
                    ))}
                  </div>
                </ErrorBoundarySection>
              )}
            </>
          )}
        </RetryHandler>
      </div>
    </LoadingWrapper>
  );
};