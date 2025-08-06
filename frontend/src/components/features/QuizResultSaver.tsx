import React, { useState } from 'react';
import { aiGuidanceService } from '../../services/aiGuidanceService';

interface QuizResultSaverProps {
  subjectName?: string;
  topicName?: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  onSaveComplete?: () => void;
}

const QuizResultSaver: React.FC<QuizResultSaverProps> = ({ 
  subjectName,
  topicName,
  totalQuestions,
  correctAnswers,
  accuracy,
  onSaveComplete
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveResults = async () => {
    if (isSaving || isSaved) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Quiz sonuçlarını AI guidance service'e kaydet
      // Şu an için mock bir soru sonucu olarak gönderiyoruz
      await aiGuidanceService.storeQuestionResult({
        question: `Quiz tamamlandı - ${totalQuestions} soru`,
        user_answer: `${correctAnswers} doğru`,
        correct_answer: `${totalQuestions} doğru`,
        is_correct: accuracy >= 50, // %50 üzerindeyse başarılı sayalım
        subject: subjectName || 'Genel',
        topic: topicName || 'Karma',
        difficulty: accuracy >= 80 ? 'kolay' : accuracy >= 50 ? 'orta' : 'zor',
        education_level: 'lise'
      });
      
      setIsSaved(true);
      
      if (onSaveComplete) {
        onSaveComplete();
      }
    } catch (err) {
      console.error('Quiz sonuçları kaydedilirken hata:', err);
      setError('Sonuçlar kaydedilirken hata oluştu');
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    // Component mount olduğunda otomatik kaydet
    handleSaveResults();
  }, []);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800">
              {error}
            </p>
            <button 
              onClick={handleSaveResults}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Tekrar dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSaved) {
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
              ✅ Sonuçlarınız başarıyla kaydedildi!
            </p>
            <p className="text-xs text-green-600 mt-1">
              {subjectName && `📚 ${subjectName}`}
              {topicName && ` - 📖 ${topicName}`}
              {` | 🎯 ${correctAnswers}/${totalQuestions} (${accuracy.toFixed(1)}%)`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-800">
            💾 Sonuçlarınız kaydediliyor...
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Performans sayfasında görüntülenebilecek
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuizResultSaver;
