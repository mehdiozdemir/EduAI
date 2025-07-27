import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSubjects,
  useTopics,
  useUserPerformance,
  useGenerateQuestions,
} from '../hooks/queries';
import { useOptimisticPerformanceAnalysis } from '../hooks/queries/useOptimisticUpdates';
import { cacheStrategies } from '../lib/cacheStrategies';
import { invalidationStrategies } from '../lib/queryInvalidation';
import { queryKeys } from '../lib/queryClient';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';

const ReactQueryDemo: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [userId] = useState(1); // Mock user ID

  // Query hooks
  const {
    data: subjects,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSubjects();
  const { data: topics, isLoading: topicsLoading } = useTopics(
    selectedSubjectId || 0,
    !!selectedSubjectId
  );
  const { data: performance, isLoading: performanceLoading } =
    useUserPerformance(userId);

  // Mutation hooks
  const generateQuestions = useGenerateQuestions();
  const optimisticAnalysis = useOptimisticPerformanceAnalysis();

  // Demo functions
  const handlePrefetchTopics = async (subjectId: number) => {
    await cacheStrategies.prefetchTopics(subjectId);
  };

  const handleGenerateQuestions = () => {
    generateQuestions.mutate({
      subject: 'Mathematics',
      topic: 'Algebra',
      difficulty: 'medium',
      count: 5,
      education_level: 'high',
    });
  };

  const handleOptimisticUpdate = () => {
    optimisticAnalysis.mutate({
      user_id: userId,
      subject_id: 1,
      topic_id: 1,
      total_questions: 10,
      correct_answers: 7,
      quiz_results: {
        total_questions: 10,
        correct_answers: 7,
        answers: [],
      },
    });
  };

  const handleInvalidateSubjects = () => {
    invalidationStrategies.subjects.onSubjectChange();
  };

  const handleCacheCleanup = () => {
    cacheStrategies.optimization.periodicCleanup();
  };

  const getCacheInfo = () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    return {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
    };
  };

  const cacheInfo = getCacheInfo();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">React Query Integration Demo</h1>

      {/* Cache Information */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cache Information</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cacheInfo.totalQueries}
              </div>
              <div className="text-sm text-gray-600">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {cacheInfo.activeQueries}
              </div>
              <div className="text-sm text-gray-600">Active Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {cacheInfo.staleQueries}
              </div>
              <div className="text-sm text-gray-600">Stale Queries</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Subjects Section */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Subjects (Cached)</h2>
          {subjectsLoading && <Loading />}
          {subjectsError && (
            <div className="text-red-600">Error: {subjectsError.message}</div>
          )}
          {subjects && (
            <div className="space-y-2">
              {subjects.map(subject => (
                <div
                  key={subject.id}
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    selectedSubjectId === subject.id
                      ? 'bg-blue-50 border-blue-300'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSubjectId(subject.id)}
                  onMouseEnter={() => handlePrefetchTopics(subject.id)}
                >
                  <div className="font-medium">{subject.name}</div>
                  <div className="text-sm text-gray-600">
                    {subject.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Topics Section */}
      {selectedSubjectId && (
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Topics (Prefetched on Hover)
            </h2>
            {topicsLoading && <Loading />}
            {topics && (
              <div className="grid grid-cols-2 gap-4">
                {topics.map(topic => (
                  <div key={topic.id} className="p-3 border rounded">
                    <div className="font-medium">{topic.name}</div>
                    <div className="text-sm text-gray-600">
                      {topic.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Performance Section */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Data</h2>
          {performanceLoading && <Loading />}
          {performance && (
            <div className="space-y-2">
              {performance.slice(0, 3).map(analysis => (
                <div key={analysis.id} className="p-3 border rounded">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Analysis #{analysis.id}</div>
                      <div className="text-sm text-gray-600">
                        {analysis.correct_answers}/{analysis.total_questions}{' '}
                        correct
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {analysis.accuracy.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Demo Actions */}
      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Demo Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={handleGenerateQuestions}
              disabled={generateQuestions.isPending}
              variant="primary"
            >
              {generateQuestions.isPending
                ? 'Generating...'
                : 'Generate Questions'}
            </Button>

            <Button
              onClick={handleOptimisticUpdate}
              disabled={optimisticAnalysis.isPending}
              variant="secondary"
            >
              {optimisticAnalysis.isPending
                ? 'Creating...'
                : 'Optimistic Analysis'}
            </Button>

            <Button onClick={handleInvalidateSubjects} variant="outline">
              Invalidate Subjects
            </Button>

            <Button onClick={handleCacheCleanup} variant="ghost">
              Cleanup Cache
            </Button>
          </div>

          {/* Mutation Results */}
          {generateQuestions.data && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="font-medium text-green-800">
                Questions Generated!
              </div>
              <div className="text-sm text-green-600">
                {generateQuestions.data.questions.length} questions created
              </div>
            </div>
          )}

          {optimisticAnalysis.data && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <div className="font-medium text-blue-800">Analysis Created!</div>
              <div className="text-sm text-blue-600">
                Accuracy: {optimisticAnalysis.data.accuracy.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ReactQueryDemo;
