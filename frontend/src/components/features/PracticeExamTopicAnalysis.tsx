import React from 'react';
import { type ExamQuestion } from '../../services/examService';

interface PracticeExamTopicAnalysisProps {
  examResults: {
    exam: {
      id: number;
      name: string;
      score: number;
      correct_answers: number;
      wrong_answers: number;
      empty_answers: number;
      total_questions: number;
      duration_minutes?: number;
      exam_type_name?: string;
      exam_section_name?: string;
    };
    statistics: {
      accuracy_rate: number;
      time_per_question: number;
      difficulty_performance: { [key: string]: number };
    };
    recommendations: string[];
    grade: string;
  } | null;
  detailedQuestions: ExamQuestion[];
  examName: string;
}

const PracticeExamTopicAnalysis: React.FC<PracticeExamTopicAnalysisProps> = ({
  examResults,
  detailedQuestions,
  examName
}) => {
  if (!examResults) {
    return null;
  }

  // Analyze topics based on questions
  const analyzeTopics = () => {
    if (!detailedQuestions || detailedQuestions.length === 0) {
      return [];
    }

    // Group questions by subject/topic if available
    const topicGroups: { [key: string]: { correct: number; total: number; questions: ExamQuestion[] } } = {};
    
    detailedQuestions.forEach((question: any) => {
      const topic = question.subject_name || question.topic_name || 'Genel Konular';
      
      if (!topicGroups[topic]) {
        topicGroups[topic] = { correct: 0, total: 0, questions: [] };
      }
      
      topicGroups[topic].total += 1;
      topicGroups[topic].questions.push(question);
      
      if (question.is_correct) {
        topicGroups[topic].correct += 1;
      }
    });

    return Object.entries(topicGroups).map(([topic, data]) => ({
      name: topic,
      correct: data.correct,
      total: data.total,
      accuracy: (data.correct / data.total) * 100,
      questions: data.questions
    }));
  };

  const topicAnalysis = analyzeTopics();

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600 bg-green-50';
    if (accuracy >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg mr-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">
          📊 Konu Bazında Analiz - {examName}
        </h3>
      </div>

      {topicAnalysis.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">📚</div>
          <p className="text-gray-600">Detaylı konu analizi için soru verisi bulunamadı.</p>
          <p className="text-sm text-gray-500 mt-2">
            Analiz yapmak için detaylı inceleme modunu kullanabilirsiniz.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {topicAnalysis.map((topic, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  {topic.name}
                </h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAccuracyColor(topic.accuracy)}`}>
                  %{topic.accuracy.toFixed(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>
                  {topic.correct} / {topic.total} doğru
                </span>
                <span>
                  {topic.total} soru
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    topic.accuracy >= 80 
                      ? 'bg-green-500' 
                      : topic.accuracy >= 60 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(topic.accuracy, 2)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Performance Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {examResults.exam.correct_answers}
            </div>
            <div className="text-sm text-blue-800">Toplam Doğru</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {topicAnalysis.length}
            </div>
            <div className="text-sm text-purple-800">Analiz Edilen Konu</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              %{examResults.statistics.accuracy_rate.toFixed(1)}
            </div>
            <div className="text-sm text-green-800">Genel Başarı</div>
          </div>
        </div>
      </div>

      {/* Recommendations based on topic analysis */}
      {topicAnalysis.some(topic => topic.accuracy < 60) && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-900 mb-2">
            💡 Gelişim Önerileri
          </h4>
          <ul className="text-sm text-yellow-800 space-y-1">
            {topicAnalysis
              .filter(topic => topic.accuracy < 60)
              .map((topic, index) => (
                <li key={index}>
                  • <strong>{topic.name}</strong> konusunda daha fazla çalışma yapmanız önerilir
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PracticeExamTopicAnalysis;
