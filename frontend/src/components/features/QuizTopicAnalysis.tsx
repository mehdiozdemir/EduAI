import React from 'react';

interface QuizResultSaverProps {
  subjectId?: number;
  subjectName?: string;
  topicId?: number;
  topicName?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  onSaveComplete?: () => void;
}

const QuizResultSaver: React.FC<QuizResultSaverProps> = ({ 
  subjectId,
  subjectName,
  topicId,
  topicName,
  totalQuestions,
  correctAnswers,
  accuracy,
  onSaveComplete
}) => {
  const handleSaveResults = async () => {
    try {
      // Quiz sonuçlarını kaydet
      const resultData = {
        subject_id: subjectId,
        subject_name: subjectName,
        topic_id: topicId,
        topic_name: topicName,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        accuracy: accuracy,
        created_at: new Date().toISOString()
      };
      
      console.log('Quiz sonuçları kaydediliyor:', resultData);
      
      // TODO: API call to save results
      // await performanceService.saveQuizResults(resultData);
      
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (error) {
      console.error('Quiz sonuçları kaydedilirken hata:', error);
    }
  };

  React.useEffect(() => {
    // Otomatik olarak sonuçları kaydet
    handleSaveResults();
  }, []);

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-green-800">
            Sonuçlarınız kaydediliyor...
          </p>
          <p className="text-xs text-green-600 mt-1">
            {subjectName && `${subjectName}`}
            {topicName && ` - ${topicName}`}
            {` | ${correctAnswers}/${totalQuestions} (${accuracy.toFixed(1)}%)`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResultSaver;
