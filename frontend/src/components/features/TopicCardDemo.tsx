import React, { useState } from 'react';
import TopicCard from './TopicCard';
import type { CourseTopic } from '../../types';

// Demo data for testing
const demoTopics: CourseTopic[] = [
  {
    id: 1,
    name: 'Doğal Sayılar',
    description: 'Doğal sayılar ve temel işlemler konularını öğrenin',
    course_id: 1,
    sort_order: 1,
    difficulty_level: 1,
    estimated_duration: 30,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Kesirler',
    description: 'Kesirler ve kesirlerle işlemler',
    course_id: 1,
    sort_order: 2,
    difficulty_level: 2,
    estimated_duration: 45,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Geometri',
    description: 'Temel geometrik şekiller ve hesaplamalar',
    course_id: 1,
    sort_order: 3,
    difficulty_level: 3,
    estimated_duration: 60,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Cebir',
    description: null,
    course_id: 1,
    sort_order: 4,
    difficulty_level: 2,
    estimated_duration: null,
    is_active: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const TopicCardDemo: React.FC = () => {
  const [selectedTopics, setSelectedTopics] = useState<CourseTopic[]>([]);

  const handleTopicToggle = (topic: CourseTopic) => {
    setSelectedTopics(prev => {
      const isSelected = prev.some(t => t.id === topic.id);
      if (isSelected) {
        return prev.filter(t => t.id !== topic.id);
      } else {
        return [...prev, topic];
      }
    });
  };

  const isTopicSelected = (topic: CourseTopic) => {
    return selectedTopics.some(t => t.id === topic.id);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">TopicCard Demo</h1>
        <p className="text-gray-600 mb-4">
          Bu demo, TopicCard bileşeninin farklı durumlarını gösterir.
        </p>
        
        {selectedTopics.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              Seçilen Konular ({selectedTopics.length}):
            </h3>
            <ul className="text-blue-800 text-sm">
              {selectedTopics.map(topic => (
                <li key={topic.id}>• {topic.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {demoTopics.map((topic) => (
          <TopicCard
            key={topic.id}
            topic={topic}
            isSelected={isTopicSelected(topic)}
            onToggle={handleTopicToggle}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Test Özellikleri:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Farklı zorluk seviyeleri (Kolay, Orta, Zor)</li>
          <li>• Açıklama olan ve olmayan konular</li>
          <li>• Süre bilgisi olan ve olmayan konular</li>
          <li>• Seçim durumu görsel geri bildirimi</li>
          <li>• Klavye navigasyonu (Tab, Enter, Space)</li>
          <li>• Erişilebilirlik özellikleri (ARIA labels)</li>
          <li>• Dokunmatik cihazlar için optimize edilmiş boyutlar</li>
        </ul>
      </div>
    </div>
  );
};

export default TopicCardDemo;