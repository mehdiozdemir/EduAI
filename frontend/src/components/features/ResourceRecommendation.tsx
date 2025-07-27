import React from 'react';
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import type { ResourceRecommendation as ResourceRecommendationType } from '../../types';

interface ResourceRecommendationProps {
  recommendation: ResourceRecommendationType;
  onResourceClick?: (url: string) => void;
  onRate?: (recommendationId: number, rating: number) => void;
  onMarkUsed?: (recommendationId: number) => void;
  showActions?: boolean;
}

const ResourceRecommendation: React.FC<ResourceRecommendationProps> = ({
  recommendation,
  onResourceClick,
  onRate,
  onMarkUsed,
  showActions = true,
}) => {
  const handleResourceClick = () => {
    if (onResourceClick) {
      onResourceClick(recommendation.url);
    } else {
      // Open in new tab with security measures
      const newWindow = window.open(recommendation.url, '_blank', 'noopener,noreferrer');
      if (newWindow) {
        newWindow.opener = null;
      }
    }
    
    // Mark as used when clicked
    if (onMarkUsed) {
      onMarkUsed(recommendation.id);
    }
  };

  const getResourceTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'website':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'youtube':
        return 'Video';
      case 'book':
        return 'Kitap';
      case 'website':
        return 'Web Sitesi';
      default:
        return 'Kaynak';
    }
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 0.8) return 'Yüksek İlgili';
    if (score >= 0.6) return 'Orta İlgili';
    return 'Düşük İlgili';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getResourceTypeIcon(recommendation.resource_type)}
            <div>
              <CardTitle className="text-base">{recommendation.title}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {getResourceTypeLabel(recommendation.resource_type)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRelevanceColor(recommendation.relevance_score)}`}>
                  {getRelevanceLabel(recommendation.relevance_score)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-gray-900">
              {Math.round(recommendation.relevance_score * 100)}%
            </div>
            <div className="text-xs text-gray-500">İlgililik</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <CardDescription className="mb-4">
          {recommendation.description}
        </CardDescription>
        
        {showActions && (
          <div className="flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              onClick={handleResourceClick}
              className="flex items-center space-x-2"
            >
              <span>Kaynağa Git</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Button>
            
            <div className="flex items-center space-x-2">
              {onRate && (
                <div className="flex items-center space-x-1">
                  <span className="text-xs text-gray-500">Değerlendir:</span>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => onRate(recommendation.id, rating)}
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceRecommendation;