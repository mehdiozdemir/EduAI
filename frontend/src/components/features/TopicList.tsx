import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Loading } from '../ui/Loading';
import type { Topic } from '../../types';

interface TopicListProps {
  topics: Topic[];
  onTopicSelect: (topicId: number) => void;
  loading?: boolean;
}

export const TopicList: React.FC<TopicListProps> = ({ 
  topics, 
  onTopicSelect, 
  loading = false 
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center py-8">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (topics.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz konu bulunmuyor
          </h3>
          <p className="text-gray-500">
            Bu ders için henüz konu eklenmemiş.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {topics.map((topic) => (
        <Card 
          key={topic.id} 
          className="p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => onTopicSelect(topic.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h4 className="text-md font-medium text-gray-900 mb-1">
                {topic.name}
              </h4>
              <p className="text-sm text-gray-600 line-clamp-2">
                {topic.description}
              </p>
              <div className="text-xs text-gray-500 mt-2">
                Oluşturulma: {new Date(topic.created_at).toLocaleDateString('tr-TR')}
              </div>
            </div>
            <div className="ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onTopicSelect(topic.id);
                }}
              >
                Seç
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default TopicList;