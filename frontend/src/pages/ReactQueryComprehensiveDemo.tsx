import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Loading } from '../components/ui/Loading';
import { useAuth } from '../hooks/useAuth';

// Import all query hooks
import {
  useSubjects,
  useTopics,
  useSearchSubjects,
} from '../hooks/queries/useSubjectQueries';

import {
  useCurrentUser,
  useLogout,
} from '../hooks/queries/useAuthQueries';

import {
  useGenerateQuestions,
  useEvaluateAnswer,
  useQuestionStats,
} from '../hooks/queries/useQuestionQueries';

import {
  useUserPerformance,
  useCreatePerformanceAnalysis,
  useDashboardData,
} from '../hooks/queries/usePerformanceQueries';

import {
  useOptimisticPerformanceAnalysis,
  useOptimisticQuizCompletion,
  useOptimisticUserUpdate,
} from '../hooks/queries/useOptimisticUpdates';

import { cacheStrategies } from '../lib/cacheStrategies';
import { invalidationStrategies } from '../lib/queryInvalidation';

const ReactQueryComprehensiveDemo: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(
    null
  );
  const [, setSelectedTopicId] = useState<number | null>(null);
  const [enableSearch, setEnableSearch] = useState(false);

  // Auth queries
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();

  // Subject queries
  const subjectsQuery = useSubjects();
  const topicsQuery = useTopics(selectedSubjectId || 0, !!selectedSubjectId);
  const searchSubjectsQuery = useSearchSubjects(searchQuery, enableSearch);

  // Question queries
  const generateQuestionsMutation = useGenerateQuestions();
  const evaluateAnswerMutation = useEvaluateAnswer();
  const questionStatsQuery = useQuestionStats(user?.id);

  // Performance queries
  const userPerformanceQuery = useUserPerformance(user?.id || 0, !!user);
  const dashboardQuery = useDashboardData(user?.id || 0, !!user);
  const createPerformanceMutation = useCreatePerformanceAnalysis();

  // Optimistic updates
  const optimisticPerformanceMutation = useOptimisticPerformanceAnalysis();
  const optimisticQuizMutation = useOptimisticQuizCompletion();
  const optimisticUserMutation = useOptimisticUserUpdate();

  const handleGenerateQuestions = () => {
    generateQuestionsMutation.mutate({
      subject: 'Mathematics',
      topic: 'Algebra',
      difficulty: 'medium',
      count: 5,
      education_level: 'high',
    });
  };

  const handleEvaluateAnswer = () => {
    evaluateAnswerMutation.mutate({
      question_id: 'test-question-1',
      user_answer: '42',
      correct_answer: '42',
      question_content: 'What is 6 * 7?',
    });
  };

  const handleCreatePerformanceAnalysis = () => {
    if (!user) return;

    createPerformanceMutation.mutate({
      user_id: user.id,
      subject_id: 1,
      topic_id: 1,
      total_questions: 10,
      correct_answers: 8,
      quiz_results: {
        total_questions: 10,
        correct_answers: 8,
        answers: [
          { question_id: '1', is_correct: true, user_answer: 'A' },
          { question_id: '2', is_correct: true, user_answer: 'B' },
          { question_id: '3', is_correct: false, user_answer: 'C' },
          { question_id: '4', is_correct: true, user_answer: 'D' },
          { question_id: '5', is_correct: true, user_answer: 'A' },
        ],
      },
    });
  };

  const handleOptimisticPerformance = () => {
    if (!user) return;

    optimisticPerformanceMutation.mutate({
      user_id: user.id,
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

  const handleOptimisticQuiz = () => {
    if (!user) return;

    optimisticQuizMutation.mutate({
      userId: user.id,
      subjectId: 1,
      topicId: 1,
      results: {
        totalQuestions: 10,
        correctAnswers: 8,
        timeSpent: 300,
      },
    });
  };

  const handleCacheWarmup = async () => {
    if (!user) return;
    await cacheStrategies.warmCache.afterLogin(user);
  };

  const handleCacheCleanup = () => {
    cacheStrategies.optimization.periodicCleanup();
  };

  const handleInvalidateAll = () => {
    invalidationStrategies.global.hardRefresh();
  };

  const handleSearch = () => {
    setEnableSearch(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          React Query Comprehensive Demo
        </h1>
        <p className="text-gray-600">
          Testing all React Query implementations with TanStack Query
        </p>
      </div>

      {/* Auth Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Authentication Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Current User</h3>
            {currentUserQuery.isLoading && <Loading size="sm" />}
            {currentUserQuery.data && (
              <p className="text-sm text-gray-600">
                Logged in as: {currentUserQuery.data.username}
              </p>
            )}
            {currentUserQuery.error && (
              <p className="text-sm text-red-600">
                Error: {currentUserQuery.error.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              variant="outline"
              size="sm"
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Subject Queries Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Subject & Topic Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">All Subjects</h3>
            {subjectsQuery.isLoading && <Loading size="sm" />}
            {subjectsQuery.data && (
              <div className="space-y-1">
                {subjectsQuery.data.slice(0, 3).map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubjectId(subject.id)}
                    className="block text-sm text-blue-600 hover:text-blue-800"
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Topics for Selected Subject</h3>
            {topicsQuery.isLoading && <Loading size="sm" />}
            {topicsQuery.data && (
              <div className="space-y-1">
                {topicsQuery.data.slice(0, 3).map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopicId(topic.id)}
                    className="block text-sm text-green-600 hover:text-green-800"
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Search</h3>
            <div className="space-y-2">
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search subjects/topics..."
              />
              <Button onClick={handleSearch} size="sm" variant="outline">
                Search
              </Button>
            </div>
            {searchSubjectsQuery.data && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  Found {searchSubjectsQuery.data.length} subjects
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Question Queries Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Question Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">Generate Questions</h3>
            <Button
              onClick={handleGenerateQuestions}
              disabled={generateQuestionsMutation.isPending}
              size="sm"
            >
              {generateQuestionsMutation.isPending
                ? 'Generating...'
                : 'Generate'}
            </Button>
            {generateQuestionsMutation.data && (
              <p className="text-xs text-green-600 mt-1">
                Generated {generateQuestionsMutation.data.questions.length}{' '}
                questions
              </p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Evaluate Answer</h3>
            <Button
              onClick={handleEvaluateAnswer}
              disabled={evaluateAnswerMutation.isPending}
              size="sm"
              variant="outline"
            >
              {evaluateAnswerMutation.isPending ? 'Evaluating...' : 'Evaluate'}
            </Button>
            {evaluateAnswerMutation.data && (
              <p className="text-xs text-green-600 mt-1">
                Score: {evaluateAnswerMutation.data.score}
              </p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Question Stats</h3>
            {questionStatsQuery.isLoading && <Loading size="sm" />}
            {questionStatsQuery.data && (
              <div className="text-xs text-gray-600">
                <p>Total: {questionStatsQuery.data.total_questions}</p>
                <p>Accuracy: {questionStatsQuery.data.accuracy}%</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Performance Queries Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Queries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <h3 className="font-medium mb-2">User Performance</h3>
            {userPerformanceQuery.isLoading && <Loading size="sm" />}
            {userPerformanceQuery.data && (
              <p className="text-xs text-gray-600">
                {userPerformanceQuery.data.length} analyses found
              </p>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Dashboard Data</h3>
            {dashboardQuery.isLoading && <Loading size="sm" />}
            {dashboardQuery.data && (
              <div className="text-xs text-gray-600">
                <p>
                  Sessions: {dashboardQuery.data.overall_stats.total_sessions}
                </p>
                <p>
                  Accuracy: {dashboardQuery.data.overall_stats.overall_accuracy}
                  %
                </p>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Create Analysis</h3>
            <Button
              onClick={handleCreatePerformanceAnalysis}
              disabled={createPerformanceMutation.isPending}
              size="sm"
            >
              {createPerformanceMutation.isPending ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Optimistic Updates Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Optimistic Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={handleOptimisticPerformance}
            disabled={optimisticPerformanceMutation.isPending}
            variant="outline"
          >
            {optimisticPerformanceMutation.isPending
              ? 'Updating...'
              : 'Optimistic Performance'}
          </Button>

          <Button
            onClick={handleOptimisticQuiz}
            disabled={optimisticQuizMutation.isPending}
            variant="outline"
          >
            {optimisticQuizMutation.isPending
              ? 'Completing...'
              : 'Optimistic Quiz'}
          </Button>

          <Button
            onClick={() =>
              optimisticUserMutation.mutate({ username: 'updated_user' })
            }
            disabled={optimisticUserMutation.isPending}
            variant="outline"
          >
            {optimisticUserMutation.isPending
              ? 'Updating...'
              : 'Optimistic User'}
          </Button>
        </div>
      </Card>

      {/* Cache Management Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Cache Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleCacheWarmup} variant="outline">
            Warm Cache
          </Button>

          <Button onClick={handleCacheCleanup} variant="outline">
            Cleanup Cache
          </Button>

          <Button onClick={handleInvalidateAll} variant="outline">
            Invalidate All
          </Button>
        </div>
      </Card>

      {/* Query Status Overview */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Query Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <h4 className="font-medium">Subjects</h4>
            <p
              className={`${subjectsQuery.isLoading ? 'text-yellow-600' : subjectsQuery.isError ? 'text-red-600' : 'text-green-600'}`}
            >
              {subjectsQuery.isLoading
                ? 'Loading'
                : subjectsQuery.isError
                  ? 'Error'
                  : 'Success'}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Performance</h4>
            <p
              className={`${userPerformanceQuery.isLoading ? 'text-yellow-600' : userPerformanceQuery.isError ? 'text-red-600' : 'text-green-600'}`}
            >
              {userPerformanceQuery.isLoading
                ? 'Loading'
                : userPerformanceQuery.isError
                  ? 'Error'
                  : 'Success'}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Dashboard</h4>
            <p
              className={`${dashboardQuery.isLoading ? 'text-yellow-600' : dashboardQuery.isError ? 'text-red-600' : 'text-green-600'}`}
            >
              {dashboardQuery.isLoading
                ? 'Loading'
                : dashboardQuery.isError
                  ? 'Error'
                  : 'Success'}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Question Stats</h4>
            <p
              className={`${questionStatsQuery.isLoading ? 'text-yellow-600' : questionStatsQuery.isError ? 'text-red-600' : 'text-green-600'}`}
            >
              {questionStatsQuery.isLoading
                ? 'Loading'
                : questionStatsQuery.isError
                  ? 'Error'
                  : 'Success'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReactQueryComprehensiveDemo;
