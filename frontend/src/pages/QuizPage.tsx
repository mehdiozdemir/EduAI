import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import QuizSession from '../components/features/QuizSession';
import { Loading } from '../components/ui/Loading';
import { questionService } from '../services/questionService';
import type { GeneratedQuestion, QuestionGenerationResponse } from '../types';

const QuizPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<GeneratedQuestion[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const subjectId = searchParams.get('subject');
    const topicId = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty') || 'medium';
    const count = parseInt(searchParams.get('count') || '5', 10);

    if (!subjectId || !topicId) {
      navigate('/subjects');
      return;
    }

    const fetchQuestions = async () => {
      try {
        const res: QuestionGenerationResponse = await questionService.generateQuestions({
          subject_id: Number(subjectId),
          topic_id: Number(topicId),
          difficulty,
          count,
        } as any);
        setQuestions(res.questions);
      } catch (err) {
        console.error(err);
        setError('Failed to load questions');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [searchParams, navigate]);

  const handleComplete = () => {
    navigate('/performance');
  };

  if (loading) return <Loading />;
  if (error || !questions) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <QuizSession questions={questions} onComplete={handleComplete} />
    </div>
  );
};

export default QuizPage; 