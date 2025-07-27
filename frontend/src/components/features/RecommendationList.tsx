import React, { useState, useMemo } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Loading } from '../ui/Loading';
import ResourceRecommendation from './ResourceRecommendation';
import type { ResourceRecommendation as ResourceRecommendationType } from '../../types';

interface RecommendationListProps {
  recommendations: ResourceRecommendationType[];
  loading?: boolean;
  error?: string;
  onResourceClick?: (url: string) => void;
  onRate?: (recommendationId: number, rating: number) => void;
  onMarkUsed?: (recommendationId: number) => void;
  onRetry?: () => void;
  title?: string;
  showFilters?: boolean;
  showActions?: boolean;
}

type ResourceType = 'all' | 'youtube' | 'book' | 'website';
type SortBy = 'relevance' | 'title' | 'type';
type SortOrder = 'asc' | 'desc';

const RecommendationList: React.FC<RecommendationListProps> = ({
  recommendations,
  loading = false,
  error,
  onResourceClick,
  onRate,
  onMarkUsed,
  onRetry,
  title = 'Kaynak Önerileri',
  showFilters = true,
  showActions = true,
}) => {
  const [selectedType, setSelectedType] = useState<ResourceType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and sort recommendations
  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(
        rec => rec.resource_type.toLowerCase() === selectedType
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        rec =>
          rec.title.toLowerCase().includes(term) ||
          rec.description.toLowerCase().includes(term)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'relevance':
          comparison = a.relevance_score - b.relevance_score;
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'tr');
          break;
        case 'type':
          comparison = a.resource_type.localeCompare(b.resource_type, 'tr');
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [recommendations, selectedType, sortBy, sortOrder, searchTerm]);

  const resourceTypeCounts = useMemo(() => {
    const counts = {
      all: recommendations.length,
      youtube: 0,
      book: 0,
      website: 0,
    };

    recommendations.forEach(rec => {
      const type = rec.resource_type.toLowerCase() as keyof typeof counts;
      if (type in counts) {
        counts[type]++;
      }
    });

    return counts;
  }, [recommendations]);

  const getTypeLabel = (type: ResourceType) => {
    switch (type) {
      case 'all':
        return 'Tümü';
      case 'youtube':
        return 'Videolar';
      case 'book':
        return 'Kitaplar';
      case 'website':
        return 'Web Siteleri';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loading size="lg" />
            <span className="ml-3 text-gray-600">Öneriler yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">{error}</p>
            </div>
            {onRetry && (
              <Button variant="outline" onClick={onRetry}>
                Tekrar Dene
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-gray-500 mb-4">
              <svg
                className="w-12 h-12 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm">Henüz kaynak önerisi bulunmuyor.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <div className="text-sm text-gray-500">
              {filteredAndSortedRecommendations.length} /{' '}
              {recommendations.length} öneri
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Önerilerde ara..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4">
                {/* Resource Type Filter */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Tür:
                  </span>
                  <div className="flex space-x-1">
                    {(
                      ['all', 'youtube', 'book', 'website'] as ResourceType[]
                    ).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          selectedType === type
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {getTypeLabel(type)} ({resourceTypeCounts[type]})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">
                    Sırala:
                  </span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortBy)}
                    className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="relevance">İlgililik</option>
                    <option value="title">Başlık</option>
                    <option value="type">Tür</option>
                  </select>
                  <button
                    onClick={() =>
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    }
                    className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    title={
                      sortOrder === 'asc' ? 'Azalan sıralama' : 'Artan sıralama'
                    }
                  >
                    <svg
                      className={`w-4 h-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 11l5-5m0 0l5 5m-5-5v12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations Grid */}
      {filteredAndSortedRecommendations.length === 0 ? (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-gray-500 mb-4">
                <svg
                  className="w-12 h-12 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <p className="text-sm">Filtrelere uygun öneri bulunamadı.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedType('all');
                  setSearchTerm('');
                  setSortBy('relevance');
                  setSortOrder('desc');
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAndSortedRecommendations.map(recommendation => (
            <ResourceRecommendation
              key={recommendation.id}
              recommendation={recommendation}
              onResourceClick={onResourceClick}
              onRate={onRate}
              onMarkUsed={onMarkUsed}
              showActions={showActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationList;
