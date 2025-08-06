import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubjectCard } from '../components/features/SubjectCard';
import { EducationLevelSelector } from '../components/features/EducationLevelSelector';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler, ErrorBoundarySection } from '../components/ui/ErrorBoundaryProvider';
import { RetryHandler, RetryUI } from '../components/ui/RetryHandler';
import { EmptyStateFallback } from '../components/ui/ErrorFallbacks';
import { subjectService } from '../services/subjectService';
import { educationService } from '../services/educationService';
import type { Subject, EducationLevelData, Course, EducationLevelName } from '../types';

export const SubjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [educationLevels, setEducationLevels] = useState<EducationLevelData[]>([]);
  const [selectedEducationLevel, setSelectedEducationLevel] = useState<EducationLevelName | null>(null);
  const [selectedEducationLevelData, setSelectedEducationLevelData] = useState<EducationLevelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const loadSubjects = async () => {
    setLoading(true);
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (error: any) {
      console.error('SubjectListPage error:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const loadEducationLevels = async () => {
    try {
      const data = await educationService.getEducationLevels();
      setEducationLevels(data);
    } catch (error: any) {
      console.error('SubjectListPage education levels error:', error);
      handleError(error);
    }
  };

  const loadCoursesByEducationLevel = async (levelId: number) => {
    setCoursesLoading(true);
    try {
      const data = await educationService.getCoursesByEducationLevel(levelId);
      setCourses(data);
    } catch (error: any) {
      console.error('SubjectListPage courses error:', error);
      handleError(error);
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleEducationLevelSelect = async (level: EducationLevelName) => {
    setSelectedEducationLevel(level);
    
    // Find the corresponding education level data - case insensitive search
    const levelData = educationLevels.find(el => 
      el.name.toLowerCase() === level.toLowerCase()
    );
    
    if (levelData) {
      setSelectedEducationLevelData(levelData);
      await loadCoursesByEducationLevel(levelData.id);
    } else {
      console.error('Education level data not found for:', level);
      setSelectedEducationLevelData(null);
      setCourses([]);
    }
  };

  // Memoized filtered courses based on selected education level
  const filteredCourses = useMemo(() => {
    if (!selectedEducationLevelData) {
      return [];
    }
    return courses.filter(course => course.education_level_id === selectedEducationLevelData.id);
  }, [courses, selectedEducationLevelData]);

  // Memoized subjects filtered by education level (fallback for legacy subjects)
  const filteredSubjects = useMemo(() => {
    if (!selectedEducationLevel) {
      return [];
    }
    
    // Define education level to subject mapping based on requirements
    const educationLevelSubjects = {
      'ilkokul': ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce'],
      'ortaokul': ['Matematik', 'Türkçe', 'Fen Bilimleri', 'Sosyal Bilgiler', 'İngilizce', 'Tarih', 'Coğrafya'],
      'lise': ['Matematik', 'Türkçe', 'Fizik', 'Kimya', 'Biyoloji', 'Tarih', 'Coğrafya', 'İngilizce', 'Edebiyat', 'Felsefe']
    };

    const allowedSubjects = educationLevelSubjects[selectedEducationLevel] || [];
    return subjects.filter(subject => allowedSubjects.includes(subject.name));
  }, [subjects, selectedEducationLevel]);

  useEffect(() => {
    const initializeData = async () => {
      await loadSubjects();
      // Education levels are loaded by EducationLevelSelector component
    };
    
    initializeData();
  }, []);

  const handleSubjectClick = (subjectId: number) => {
    navigate(`/subjects/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dersler</h1>
          <p className="text-gray-600 text-sm sm:text-base">Çalışmak istediğiniz dersi seçin</p>
        </div>
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Dersler yükleniyor..." />
        </div>
      </div>
    );
  }

  return (
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
            
            {/* Education Level Selection - Always shown by default */}
            {!lastError && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Eğitim Seviyenizi Seçin</h2>
                <EducationLevelSelector
                  selectedLevel={selectedEducationLevel}
                  onLevelSelect={handleEducationLevelSelect}
                  onEducationLevelsLoaded={setEducationLevels}
                />
                {/* Instruction message when no level is selected */}
                {!selectedEducationLevel && (
                  <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-gray-600 text-center text-sm sm:text-base">
                      Derslerinizi görmek için önce eğitim seviyenizi seçin.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Education Level and Change Option */}
            {selectedEducationLevelData && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 text-sm sm:text-base">
                      Seçilen Eğitim Seviyesi: {selectedEducationLevelData.name}
                    </h3>
                    {selectedEducationLevelData.grade_range && (
                      <p className="text-xs sm:text-sm text-blue-700">{selectedEducationLevelData.grade_range}</p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedEducationLevel(null);
                      setSelectedEducationLevelData(null);
                      setCourses([]);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium self-start sm:self-center px-2 py-1 rounded hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                  >
                    Değiştir
                  </button>
                </div>
              </div>
            )}

            {/* Courses Loading State */}
            {coursesLoading && (
              <div className="flex justify-center py-8">
                <Loading size="md" text="Dersler yükleniyor..." />
              </div>
            )}

            {/* Empty state when no courses for selected education level */}
            {!lastError && selectedEducationLevelData && !coursesLoading && filteredCourses.length === 0 && filteredSubjects.length === 0 && (
              <EmptyStateFallback
                title="Bu Eğitim Seviyesi İçin Ders Bulunmuyor"
                description={`${selectedEducationLevelData.name} seviyesi için henüz ders eklenmemiş.`}
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
            
            {/* Course/Subject Grid - Only shown when education level is selected */}
            {selectedEducationLevel && (
              <>
                {/* Display filtered courses */}
                {selectedEducationLevelData && !coursesLoading && filteredCourses.length > 0 && (
                  <ErrorBoundarySection>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedEducationLevelData.name} Dersleri ({filteredCourses.length})
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredCourses.map((course) => (
                        <div
                          key={course.id}
                          onClick={() => {
                            // Create navigation state for topic selection
                            const navigationState = {
                              course: {
                                ...course,
                                education_level: selectedEducationLevelData!
                              },
                              educationLevel: selectedEducationLevelData!
                            };
                            navigate(`/app/courses/${course.id}/topics`, { state: navigationState });
                          }}
                          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                        >
                          <h4 className="font-semibold text-gray-900 mb-2">{course.name}</h4>
                          {course.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                          )}
                          {course.code && (
                            <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded">
                              {course.code}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </ErrorBoundarySection>
                )}

                {/* Fallback: Display filtered subjects if no courses available */}
                {!coursesLoading && filteredCourses.length === 0 && filteredSubjects.length > 0 && (
                  <ErrorBoundarySection>
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {selectedEducationLevelData?.name || selectedEducationLevel} Dersleri ({filteredSubjects.length})
                      </h3>
                      <p className="text-sm text-gray-600">Geçici olarak eski ders sistemi kullanılıyor.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                      {filteredSubjects.map((subject) => (
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

            {/* General empty state when no education levels */}
            {!lastError && educationLevels.length === 0 && subjects.length === 0 && !loading && (
              <EmptyStateFallback
                title="No Content Available"
                description="No education levels or subjects have been added to the system yet."
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
          </>
        )}
      </RetryHandler>
    </div>
  );
};