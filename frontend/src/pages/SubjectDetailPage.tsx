import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopicList } from '../components/features/TopicList';
import { Loading } from '../components/ui/Loading';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { subjectService } from '../services/subjectService';
import type { Subject, Topic } from '../types';

export const SubjectDetailPage: React.FC = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (subjectId) {
      loadSubjectAndTopics(parseInt(subjectId));
    }
  }, [subjectId]);

  const loadSubjectAndTopics = async (id: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load subject details and topics in parallel
      const [subjectData, topicsData] = await Promise.all([
        subjectService.getSubject(id),
        subjectService.getTopics(id)
      ]);
      
      setSubject(subjectData);
      setTopics(topicsData);
    } catch (err: any) {
      setError(err.message || 'Ders bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadTopics = async (id: number) => {
    setTopicsLoading(true);
    
    try {
      const topicsData = await subjectService.getTopics(id);
      setTopics(topicsData);
    } catch (err: any) {
      setError(err.message || 'Konular yüklenirken bir hata oluştu');
    } finally {
      setTopicsLoading(false);
    }
  };

  const handleTopicSelect = (topicId: number) => {
    // Navigate to question generation page with selected topic
    navigate(`/questions/generate?subject=${subjectId}&topic=${topicId}`);
  };

  const handleBackToSubjects = () => {
    navigate('/subjects');
  };

  const handleRetry = () => {
    if (subjectId) {
      loadSubjectAndTopics(parseInt(subjectId));
    }
  };

  const handleRetryTopics = () => {
    if (subjectId) {
      loadTopics(parseInt(subjectId));
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubjects}
            className="mb-4"
          >
            ← Derslere Dön
          </Button>
        </div>
        
        <div className="flex justify-center py-12">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubjects}
            className="mb-4"
          >
            ← Derslere Dön
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-red-500">
            <svg 
              className="mx-auto h-12 w-12 text-red-400 mb-4" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bir hata oluştu
            </h3>
            <p className="text-gray-600 mb-4">
              {error}
            </p>
            <Button onClick={handleRetry}>
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubjects}
            className="mb-4"
          >
            ← Derslere Dön
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ders bulunamadı
            </h3>
            <p className="text-gray-500">
              Aradığınız ders mevcut değil.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleBackToSubjects}
          className="mb-4"
        >
          ← Derslere Dön
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subject.name}
          </h1>
          <p className="text-gray-600 mb-4">
            {subject.description}
          </p>
          <div className="text-sm text-gray-500">
            Oluşturulma: {new Date(subject.created_at).toLocaleDateString('tr-TR')}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Konular
          </h2>
          {topics.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRetryTopics}
              disabled={topicsLoading}
            >
              {topicsLoading ? 'Yenileniyor...' : 'Yenile'}
            </Button>
          )}
        </div>
        
        <TopicList
          topics={topics}
          onTopicSelect={handleTopicSelect}
          loading={topicsLoading}
        />
      </div>
    </div>
  );
};