import React from 'react';
import {
  RecommendationList,
  ResourceRecommendation,
} from '../components/features';
import Card, {
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/Card';

import type { ResourceRecommendation as ResourceRecommendationType } from '../types';

// Demo data for testing
const demoRecommendations: ResourceRecommendationType[] = [
  {
    id: 1,
    resource_type: 'youtube',
    title: 'React Hooks Comprehensive Tutorial',
    url: 'https://youtube.com/watch?v=example1',
    description:
      'Learn React Hooks with practical examples and real-world applications. This comprehensive tutorial covers useState, useEffect, useContext, and custom hooks.',
    relevance_score: 0.92,
  },
  {
    id: 2,
    resource_type: 'book',
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    url: 'https://example.com/clean-code',
    description:
      'Essential reading for any developer. Learn how to write clean, maintainable code that stands the test of time.',
    relevance_score: 0.88,
  },
  {
    id: 3,
    resource_type: 'website',
    title: 'MDN Web Docs - JavaScript Guide',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
    description:
      'Comprehensive documentation and tutorials for JavaScript. Perfect for both beginners and advanced developers.',
    relevance_score: 0.85,
  },
  {
    id: 4,
    resource_type: 'youtube',
    title: 'TypeScript for Beginners',
    url: 'https://youtube.com/watch?v=example2',
    description:
      'Get started with TypeScript and learn how to add type safety to your JavaScript projects.',
    relevance_score: 0.78,
  },
  {
    id: 5,
    resource_type: 'website',
    title: 'React Official Documentation',
    url: 'https://react.dev',
    description:
      'The official React documentation with guides, API reference, and best practices.',
    relevance_score: 0.95,
  },
];

const RecommendationsDemo: React.FC = () => {
  // Example of using the hook (commented out since we don't have real API)
  // const {
  //   recommendations,
  //   loading,
  //   error,
  //   rateRecommendation,
  //   markRecommendationUsed,
  //   retry
  // } = useRecommendations({
  //   subjectId: 1,
  //   topicId: 2,
  //   resourceType: 'youtube',
  //   limit: 10
  // });

  const handleResourceClick = (url: string) => {
    // Custom handling for resource clicks
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRate = async (recommendationId: number, rating: number) => {
    // In real app, this would call the API
    alert(`Kaynak ${recommendationId} için ${rating} yıldız verdiniz!`);
  };

  const handleMarkUsed = async (recommendationId: number) => {
    // In real app, this would call the API
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Kaynak Önerisi Sistemi Demo
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Bu sayfa, yeni geliştirilen kaynak önerisi sisteminin özelliklerini
          göstermektedir. Filtreleme, sıralama, değerlendirme ve kaynak
          türlerine göre kategorilendirme özelliklerini test edebilirsiniz.
        </p>
      </div>

      {/* Main Recommendation List */}
      <RecommendationList
        recommendations={demoRecommendations}
        onResourceClick={handleResourceClick}
        onRate={handleRate}
        onMarkUsed={handleMarkUsed}
        title="Önerilen Kaynaklar"
        showFilters={true}
        showActions={true}
      />

      {/* Individual Component Examples */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tekil Kaynak Önerisi Örneği</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceRecommendation
              recommendation={demoRecommendations[0]}
              onResourceClick={handleResourceClick}
              onRate={handleRate}
              onMarkUsed={handleMarkUsed}
              showActions={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Aksiyonsuz Kaynak Önerisi</CardTitle>
          </CardHeader>
          <CardContent>
            <ResourceRecommendation
              recommendation={demoRecommendations[1]}
              showActions={false}
            />
          </CardContent>
        </Card>
      </div>

      {/* Filtered Examples */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sadece Video Kaynakları</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationList
              recommendations={demoRecommendations.filter(
                r => r.resource_type === 'youtube'
              )}
              onResourceClick={handleResourceClick}
              onRate={handleRate}
              onMarkUsed={handleMarkUsed}
              title="Video Önerileri"
              showFilters={false}
              showActions={true}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Yüksek İlgililik Skorlu Kaynaklar</CardTitle>
          </CardHeader>
          <CardContent>
            <RecommendationList
              recommendations={demoRecommendations.filter(
                r => r.relevance_score >= 0.9
              )}
              onResourceClick={handleResourceClick}
              onRate={handleRate}
              onMarkUsed={handleMarkUsed}
              title="En İlgili Kaynaklar"
              showFilters={false}
              showActions={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationsDemo;
