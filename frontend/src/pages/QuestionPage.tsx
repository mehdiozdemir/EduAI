import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import QuestionGenerator from '../components/features/QuestionGenerator';
import QuizSession from '../components/features/QuizSession';
import { Loading } from '../components/ui/Loading';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { questionService } from '../services/questionService';
import { subjectService } from '../services/subjectService';
import type { 
  QuestionParams, 
  QuestionGenerationResponse, 
  QuizResults,
  Subject,
  Topic
} from '../types';

type PageState = 'generator' | 'quiz' | 'loading';

export const QuestionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [pageState, setPageState] = useState<PageState>('generator');
  const [subject, setSubject] = useState<Subject | null>(null);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuestionGenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get subject and topic IDs from URL params
  const subjectId = searchParams.get('subject');
  const topicId = searchParams.get('topic');

  useEffect(() => {
    if (subjectId && topicId) {
      loadSubjectAndTopic(parseInt(subjectId), parseInt(topicId));
    }
  }, [subjectId, topicId]);

  const loadSubjectAndTopic = async (subjectIdNum: number, topicIdNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const [subjectData, topicsData] = await Promise.all([
        subjectService.getSubject(subjectIdNum),
        subjectService.getTopics(subjectIdNum)
      ]);
      
      const selectedTopic = topicsData.find(t => t.id === topicIdNum);
      
      if (!selectedTopic) {
        throw new Error('Seçilen konu bulunamadı');
      }
      
      setSubject(subjectData);
      setTopic(selectedTopic);
    } catch (err: any) {
      setError(err.message || 'Ders ve konu bilgileri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async (params: QuestionParams) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await questionService.generateQuestions(params);
      setQuestions(response);
      setPageState('quiz');
    } catch (err: any) {
      setError(err.message || 'Sorular üretilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (results: QuizResults) => {
    // Here you could save the results to the backend
    
    // For now, just reset to generator
    setPageState('generator');
    setQuestions(null);
  };

  const handleExitQuiz = () => {
    setPageState('generator');
    setQuestions(null);
  };

  const handleBackToSubject = () => {
    if (subjectId) {
      navigate(`/subjects/${subjectId}`);
    } else {
      navigate('/subjects');
    }
  };

  const handleRetry = () => {
    if (subjectId && topicId) {
      loadSubjectAndTopic(parseInt(subjectId), parseInt(topicId));
    }
  };

  if (loading && pageState === 'generator') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubject}
            className="mb-4"
          >
            ← Geri Dön
          </Button>
        </div>
        
        <div className="flex justify-center py-12">
          <Loading size="lg" text="Sayfa yükleniyor..." />
        </div>
      </div>
    );
  }

  if (error && !subject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubject}
            className="mb-4"
          >
            ← Geri Dön
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

  if (!subject || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={handleBackToSubject}
            className="mb-4"
          >
            ← Geri Dön
          </Button>
        </div>
        
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Geçersiz sayfa
            </h3>
            <p className="text-gray-500">
              Lütfen önce bir ders ve konu seçin.
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
          onClick={pageState === 'quiz' ? handleExitQuiz : handleBackToSubject}
          className="mb-4"
        >
          ← {pageState === 'quiz' ? 'Quiz\'ten Çık' : 'Geri Dön'}
        </Button>
        
        {pageState === 'generator' && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Soru Üretici
            </h1>
            <p className="text-gray-600">
              {subject.name} - {topic.name} konusu için sorular üretin
            </p>
          </div>
        )}
      </div>

      {error && pageState === 'generator' && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <div className="flex items-center">
            <svg 
              className="h-5 w-5 text-red-400 mr-2" 
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
            <p className="text-red-700">{error}</p>
          </div>
        </Card>
      )}

      {pageState === 'generator' && (
        <QuestionGenerator
          subject={subject.name}
          topic={topic.name}
          onGenerate={handleGenerateQuestions}
          loading={loading}
        />
      )}

      {pageState === 'quiz' && questions && (
        <QuizSession
          questions={questions.questions}
          onComplete={handleQuizComplete}
          onExit={handleExitQuiz}
        />
      )}
    </div>
  );
};