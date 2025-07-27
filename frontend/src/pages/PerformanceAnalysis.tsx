import React, { useEffect, useState } from 'react';
import { performanceService } from '../services/performanceService';
import { subjectService } from '../services/subjectService';
import { useAuth } from '../hooks/useAuth';
import { PerformanceChart } from '../components/features/PerformanceChart';
import Card from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import type { PerformanceAnalysis, PerformanceData, Subject, SortParams, PaginationParams } from '../types';

interface FilterParams {
  subject_id?: number;
  topic_id?: number;
  date_from?: string;
  date_to?: string;
}

export const PerformanceAnalysisPage: React.FC = () => {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState<PerformanceAnalysis[]>([]);
  const [trendsData, setTrendsData] = useState<PerformanceData[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({});
  const [sortParams, setSortParams] = useState<SortParams>({
    sort_by: 'created_at',
    sort_order: 'desc',
  });
  const [pagination, setPagination] = useState<PaginationParams>({
    page: 1,
    per_page: 10,
  });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subjects for filter dropdown
        const subjectsData = await subjectService.getSubjects();
        setSubjects(subjectsData);

        // Fetch performance data
        const performanceParams = {
          ...filters,
          ...sortParams,
          ...pagination,
        };
        const performance = await performanceService.getUserPerformance(user?.id, performanceParams);
        setPerformanceData(performance);

        // Fetch trends data
        const trends = await performanceService.getPerformanceTrends(user?.id, {
          period: timePeriod,
          subject_id: filters.subject_id,
          topic_id: filters.topic_id,
        });
        setTrendsData(trends);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to load performance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, filters, sortParams, pagination, timePeriod]);

  const handleFilterChange = (key: keyof FilterParams, value: string | number | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleSortChange = (sortBy: string) => {
    setSortParams(prev => ({
      sort_by: sortBy,
      sort_order: prev.sort_by === sortBy && prev.sort_order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleExport = async (format: 'csv' | 'json' | 'pdf') => {
    try {
      const blob = await performanceService.exportPerformanceData(user?.id, format, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `performance-data.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({});
    setPagination({ page: 1, per_page: 10 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center">
          <div className="text-red-500 text-lg mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analysis</h1>
          <p className="text-gray-600 mt-1">Detailed insights into your learning progress</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            className="text-sm"
          >
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('json')}
            className="text-sm"
          >
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters & Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <select
              value={filters.subject_id || ''}
              onChange={(e) => handleFilterChange('subject_id', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <Input
              type="date"
              value={filters.date_from || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_from', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <Input
              type="date"
              value={filters.date_to || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_to', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value as 'week' | 'month' | 'quarter' | 'year')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex space-x-2">
            <Button
              variant={chartType === 'line' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('line')}
            >
              Line Chart
            </Button>
            <Button
              variant={chartType === 'bar' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('bar')}
            >
              Bar Chart
            </Button>
            <Button
              variant={chartType === 'doughnut' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setChartType('doughnut')}
            >
              Doughnut Chart
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Performance Trends Chart */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <PerformanceChart
          data={trendsData}
          type={chartType}
          height={400}
          showLegend={true}
          title={`Performance Over Time (${timePeriod})`}
        />
      </Card>

      {/* Performance History Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance History</h3>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {performanceData.length} results
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('created_at')}
                >
                  Date
                  {sortParams.sort_by === 'created_at' && (
                    <span className="ml-1">
                      {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topic
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('total_questions')}
                >
                  Questions
                  {sortParams.sort_by === 'total_questions' && (
                    <span className="ml-1">
                      {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('correct_answers')}
                >
                  Correct
                  {sortParams.sort_by === 'correct_answers' && (
                    <span className="ml-1">
                      {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('accuracy')}
                >
                  Accuracy
                  {sortParams.sort_by === 'accuracy' && (
                    <span className="ml-1">
                      {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSortChange('weakness_level')}
                >
                  Weakness Level
                  {sortParams.sort_by === 'weakness_level' && (
                    <span className="ml-1">
                      {sortParams.sort_order === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {performanceData.map((performance) => (
                <tr key={performance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(performance.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Subject {performance.subject_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Topic {performance.topic_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {performance.total_questions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {performance.correct_answers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 max-w-[100px]">
                        <div
                          className={`h-2 rounded-full ${
                            performance.accuracy >= 80
                              ? 'bg-green-500'
                              : performance.accuracy >= 60
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${performance.accuracy}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{performance.accuracy.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        performance.weakness_level <= 3
                          ? 'bg-green-100 text-green-800'
                          : performance.weakness_level <= 6
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {performance.weakness_level}/10
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {performanceData.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-400 text-lg mb-2">📊</div>
            <p className="text-gray-500">No performance data found for the selected filters.</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {performanceData.length > 0 && (
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={pagination.per_page}
                onChange={(e) => setPagination(prev => ({ ...prev, per_page: parseInt(e.target.value), page: 1 }))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-600">per page</span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination.page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={performanceData.length < pagination.per_page}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PerformanceAnalysisPage;