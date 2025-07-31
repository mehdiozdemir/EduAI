import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { performanceService } from '../services/performanceService';
import { useAuth } from '../hooks/useAuth';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { Loading } from '../components/ui/Loading';
import { useErrorHandler, ErrorBoundarySection } from '../components/ui/ErrorBoundaryProvider';
import { RetryHandler, RetryUI } from '../components/ui/RetryHandler';
import { PerformanceChart } from '../components/features/PerformanceChart';
import Card from '../components/ui/Card';
import ResponsiveGrid from '../components/ui/ResponsiveGrid';
import ResponsiveContainer from '../components/ui/ResponsiveContainer';
import { ResponsiveTable, ResponsiveTableHeader, ResponsiveTableBody, ResponsiveTableRow, ResponsiveTableCell } from '../components/ui/ResponsiveTable';
import type { PerformanceAnalysis, PerformanceData } from '../types';

interface DashboardData {
  overall_stats: {
    total_questions: number;
    total_correct: number;
    overall_accuracy: number;
    total_sessions: number;
  };
  recent_performance: PerformanceAnalysis[];
  subject_breakdown: Array<{
    subject_name: string;
    accuracy: number;
    question_count: number;
  }>;
  weakness_areas: Array<{
    topic_name: string;
    subject_name: string;
    weakness_level: number;
    recommendation_count: number;
  }>;
  progress_chart: PerformanceData[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { isMobile } = useBreakpoint();
  const { handleError } = useErrorHandler();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!user?.id) return;

    console.log('Dashboard.fetchDashboardData called');
    setLoading(true);
    try {
      const data = await performanceService.getDashboardData(user.id);
      console.log('Dashboard received data:', data);
      setDashboardData(data);
    } catch (error: any) {
      console.error('Dashboard error:', error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Dashboard yükleniyor..." />
      </div>
    );
  }

  if (!dashboardData && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-gray-400 text-lg mb-4">📊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600 mb-4">Start taking quizzes to see your performance data.</p>
          <Link
            to="/subjects"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Subjects
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <RetryHandler
      operation={fetchDashboardData}
      onError={handleError}
      maxAttempts={3}
    >
      {({ retry, isRetrying, lastError, canRetry }) => (
        <ResponsiveContainer size="full" padding="none">
          {lastError && (
            <div className="mb-6">
              <RetryUI
                error={lastError}
                onRetry={retry}
                isRetrying={isRetrying}
                attempt={1}
                maxAttempts={3}
                canRetry={canRetry}
                title="Failed to Load Dashboard"
                description="Unable to fetch dashboard data. Please try again."
              />
            </div>
          )}

          {dashboardData && (
            <DashboardContent
              dashboardData={dashboardData}
              user={user}
              isMobile={isMobile}
            />
          )}
        </ResponsiveContainer>
      )}
    </RetryHandler>
  );
};

const DashboardContent: React.FC<{
  dashboardData: DashboardData;
  user: any;
  isMobile: boolean;
}> = ({ dashboardData, user, isMobile }) => {
  const { overall_stats, recent_performance, subject_breakdown, weakness_areas, progress_chart } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Ana Sayfa</h1>
          <p className="text-gray-600 mt-1">Hoşgeldin, {user?.username}!</p>
        </div>
        <Link
          to="/performance"
          className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center sm:py-2 touch-manipulation min-h-[48px] flex items-center justify-center"
        >
          Detaylı Analizleri Gör
        </Link>
      </div>

      {/* Overall Stats */}
      <ErrorBoundarySection>
        <ResponsiveGrid
          cols={{ default: 1, sm: 2, lg: 4 }}
          gap="md"
        >
          <Card className="p-4 sm:p-6 touch-manipulation">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <div className="text-blue-600 text-xl">📝</div>
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Toplam Soru</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{overall_stats.total_questions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 touch-manipulation">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <div className="text-green-600 text-xl">✅</div>
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Doğru Cevaplar</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{overall_stats.total_correct}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 touch-manipulation">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg flex-shrink-0">
                <div className="text-yellow-600 text-xl">🎯</div>
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Doğruluk Oranı</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{overall_stats.overall_accuracy.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 touch-manipulation">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <div className="text-purple-600 text-xl">📚</div>
              </div>
              <div className="ml-4 min-w-0">
                <p className="text-sm font-medium text-gray-600">Toplam Oturum</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{overall_stats.total_sessions}</p>
              </div>
            </div>
          </Card>
        </ResponsiveGrid>
      </ErrorBoundarySection>

      {/* Charts Row */}
      <ErrorBoundarySection>
        <ResponsiveGrid
          cols={{ default: 1, lg: 2 }}
          gap="md"
        >
          {/* Progress Chart */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans</h3>
            <div className="overflow-x-auto">
              <PerformanceChart
                data={progress_chart}
                type="line"
                height={isMobile ? 200 : 250}
                showLegend={!isMobile}
              />
            </div>
          </Card>

          {/* Subject Breakdown */}
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Performansı</h3>
            <div className="overflow-x-auto">
              <PerformanceChart
                data={progress_chart}
                type="doughnut"
                height={isMobile ? 200 : 250}
                showLegend={!isMobile}
              />
            </div>
          </Card>
        </ResponsiveGrid>
      </ErrorBoundarySection>

      {/* Subject Breakdown Table */}
      <ErrorBoundarySection>
        <Card className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ders Dağılımı</h3>
          <ResponsiveTable>
            <ResponsiveTableHeader>
              <ResponsiveTableRow>
                <ResponsiveTableCell header>Konu</ResponsiveTableCell>
                <ResponsiveTableCell header>Doğrular</ResponsiveTableCell>
                <ResponsiveTableCell header hideOnMobile>Sorular</ResponsiveTableCell>
                <ResponsiveTableCell header>Durum</ResponsiveTableCell>
              </ResponsiveTableRow>
            </ResponsiveTableHeader>
            <ResponsiveTableBody>
              {subject_breakdown.map((subject, index) => (
                <ResponsiveTableRow key={index}>
                  <ResponsiveTableCell mobileLabel="Subject">
                    <div className="truncate max-w-[120px] sm:max-w-none font-medium">
                      {subject.subject_name}
                    </div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Accuracy">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 min-w-[40px] sm:mr-3">
                        <div
                          className={`h-2 rounded-full ${subject.accuracy >= 80
                              ? 'bg-green-500'
                              : subject.accuracy >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                          style={{ width: `${subject.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{subject.accuracy.toFixed(1)}%</span>
                    </div>
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Questions" hideOnMobile>
                    {subject.question_count}
                  </ResponsiveTableCell>
                  <ResponsiveTableCell mobileLabel="Status">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${subject.accuracy >= 80
                          ? 'bg-green-100 text-green-800'
                          : subject.accuracy >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {subject.accuracy >= 80 ? 'Excellent' : subject.accuracy >= 60 ? 'Good' : 'Needs Work'}
                    </span>
                  </ResponsiveTableCell>
                </ResponsiveTableRow>
              ))}
            </ResponsiveTableBody>
          </ResponsiveTable>
        </Card>
      </ErrorBoundarySection>

      {/* Weakness Areas */}
      {weakness_areas.length > 0 && (
        <ErrorBoundarySection>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
            <ResponsiveGrid
              cols={{ default: 1, sm: 2, lg: 3 }}
              gap="sm"
            >
              {weakness_areas.slice(0, 6).map((area, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 touch-manipulation">
                  <h4 className="font-medium text-red-900 text-sm sm:text-base truncate">{area.topic_name}</h4>
                  <p className="text-xs sm:text-sm text-red-700 mb-2 truncate">{area.subject_name}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                    <span className="text-xs text-red-600">
                      Weakness Level: {area.weakness_level}/10
                    </span>
                    <span className="text-xs text-red-600">
                      {area.recommendation_count} recommendations
                    </span>
                  </div>
                </div>
              ))}
            </ResponsiveGrid>
            {weakness_areas.length > 6 && (
              <div className="mt-4 text-center">
                <Link
                  to="/performance"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium touch-manipulation inline-block py-2"
                >
                  View all areas for improvement →
                </Link>
              </div>
            )}
          </Card>
        </ErrorBoundarySection>
      )}

      {/* Recent Performance */}
      {recent_performance.length > 0 && (
        <ErrorBoundarySection>
          <Card className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Performance</h3>
            <div className="space-y-3">
              {recent_performance.slice(0, 5).map((performance) => (
                <div key={performance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg touch-manipulation">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {performance.correct_answers}/{performance.total_questions} correct
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(performance.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="font-semibold text-gray-900">{performance.accuracy.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                to="/performance"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium touch-manipulation inline-block py-2"
              >
                View all performance history →
              </Link>
            </div>
          </Card>
        </ErrorBoundarySection>
      )}
    </div>
  );
};

export default Dashboard;