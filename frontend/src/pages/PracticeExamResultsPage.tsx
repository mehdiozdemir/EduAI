import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { examService, type ExamQuestion } from '../services/examService';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';
import ExamAnalysisResults from '../components/exam/ExamAnalysisResults';
import AIAnalysisAnimation from '../components/ui/AIAnalysisAnimation';
import { useAuth } from '../hooks/useAuth';

interface LocationState {
  examName?: string;
  result?: {
    message: string;
    score: number;
    correct_count: number;
    total_questions: number;
    results: any;
  };
}

interface ExamResults {
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
}

interface ParallelProcessingResult {
  enabled: boolean;
  execution_summary?: {
    total_agents: number;
    successful_agents: number;
    failed_agents: number;
  };
  processing_time?: string;
  error?: string;
  fallback?: boolean;
}

const PracticeExamResultsPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { user } = useAuth();

  const [results, setResults] = useState<ExamResults | null>(null);
  const [detailedQuestions, setDetailedQuestions] = useState<ExamQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedReview, setShowDetailedReview] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null); // ExamAnalysisResults component'in kendi type'ını kullanacak
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Auto analysis states
  const [autoAnalysisRunning, setAutoAnalysisRunning] = useState(false);
  const [analysisStage, setAnalysisStage] = useState<'analyzing' | 'processing' | 'generating' | 'completed'>('analyzing');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Parallel processing info (sadece bilgi amaçlı)
  const [parallelProcessing, setParallelProcessing] = useState<ParallelProcessingResult | null>(null);

  useEffect(() => {
    if (examId) {
      loadResults();
    }
  }, [examId]);

  // Auto-start AI analysis when results are loaded (only for fresh exam results)
  useEffect(() => {
    // Check if this is a fresh exam result (from state) and no existing analysis
    const isFreshExamResult = state?.result && !analysisData;
    // Also check if we don't have analysis data in results already
    const hasExistingAnalysis = results && (results as any).analysis;
    
    console.log('🔍 Auto-analysis check:', {
      results: !!results,
      analysisData: !!analysisData,
      autoAnalysisRunning,
      analysisLoading,
      isFreshExamResult,
      hasExistingAnalysis
    });
    
    if (results && !analysisData && !autoAnalysisRunning && !analysisLoading && isFreshExamResult && !hasExistingAnalysis) {
      console.log('🚀 Starting auto-analysis...');
      startAutoAnalysis();
    }
  }, [results]);

  // Process exam results - sadece analiz verilerini işle
  const processExamResults = (backendResults: any) => {
    console.log('🔍 Backend results received:', backendResults);
    console.log('🔍 Analysis data:', backendResults.analysis);
    
    // Handle parallel processing info (sadece bilgi amaçlı)
    if (backendResults.parallel_processing) {
      setParallelProcessing(backendResults.parallel_processing);
    }
    
    // Handle analysis data - YouTube/Book önerileri artık analysis içinde
    if (backendResults.analysis && backendResults.analysis_status === 'success') {
      setAnalysisData(backendResults.analysis);
      setShowAnalysis(true);
      console.log('🧠 Analysis data set successfully');
    } else if (backendResults.analysis) {
      // If there's analysis data but no status, it might be existing data
      setAnalysisData(backendResults.analysis);
      setShowAnalysis(true);
      console.log('🧠 Existing analysis data loaded');
    } else {
      console.log('🧠 Analysis data not available:', backendResults.analysis_status);
    }
    
    // Transform backend response to expected frontend format
    const transformedResults: ExamResults = {
      exam: {
        id: backendResults.exam_id || parseInt(examId!),
        name: state?.examName || 'Deneme Sınavı',
        score: backendResults.score || 0,
        correct_answers: backendResults.correct_answers || 0,
        wrong_answers: backendResults.wrong_answers || 0,
        empty_answers: backendResults.empty_answers || 0,
        total_questions: backendResults.total_questions || 0,
        duration_minutes: 0,
        exam_type_name: backendResults.exam_type || 'Bilinmiyor',
        exam_section_name: backendResults.exam_section || 'Bilinmiyor'
      },
      statistics: {
        accuracy_rate: backendResults.percentage || 0,
        time_per_question: (backendResults.time_spent || 0) / Math.max(1, backendResults.total_questions || 1),
        difficulty_performance: backendResults.difficulty_performance || {}
      },
      recommendations: [],
      grade: backendResults.percentage >= 80 ? 'A' : 
             backendResults.percentage >= 60 ? 'B' : 
             backendResults.percentage >= 40 ? 'C' : 'D'
    };
    
    return transformedResults;
  };

  // Auto analysis with animation
  const startAutoAnalysis = async () => {
    if (!user?.id) return;
    
    setAutoAnalysisRunning(true);
    setAnalysisStage('analyzing');
    setAnalysisProgress(0);

    try {
      // Simulate progress stages
      const updateProgress = (stage: typeof analysisStage, progress: number) => {
        setAnalysisStage(stage);
        setAnalysisProgress(progress);
      };

      // Stage 1: Analyzing (0-25%)
      updateProgress('analyzing', 10);
      await new Promise(resolve => setTimeout(resolve, 1500));
      updateProgress('analyzing', 25);

      // Stage 2: Processing (25-50%)
      updateProgress('processing', 35);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Start actual analysis
      const analysisResponse = await examService.getExamAnalysis(parseInt(examId!), user.id);
      
      updateProgress('processing', 50);

      // Stage 3: Generating (50-75%)
      updateProgress('generating', 60);
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateProgress('generating', 75);

      // Stage 4: Completing (75-100%)
      await new Promise(resolve => setTimeout(resolve, 800));
      updateProgress('completed', 100);

      // Process results
      if (analysisResponse.status === 'success' && analysisResponse.data) {
        setAnalysisData(analysisResponse.data);
        setShowAnalysis(true);
        
        // Parallel processing artık sadece ExamAnalysisResults component'i içinde yönetiliyor
      }

      // Wait a bit to show completion
      await new Promise(resolve => setTimeout(resolve, 1500));
      
    } catch (error) {
      console.error('Auto analysis error:', error);
      setAnalysisProgress(100);
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setAutoAnalysisRunning(false);
    }
  };

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      // İlk önce state'ten gelen result'ı kontrol et
      if (state?.result) {
        console.log('🎯 Using result from navigation state:', state.result);
        const transformedResults = processExamResults(state.result);
        setResults(transformedResults);
        return;
      }

      // State'te result yoksa backend'ten çek
      console.log('🔍 No result in state, fetching from backend...');
      const backendResults: any = await examService.getExamResults(parseInt(examId!));
      
      // Use the new processing function
      const transformedResults = processExamResults(backendResults);
      console.log('Transformed results:', transformedResults);
      setResults(transformedResults);

    } catch (err) {
      console.error('Error loading results:', err);
      setError('Sonuçlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysisData = async () => {
    if (!user?.id) {
      setError('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      setAnalysisLoading(true);
      const analysisResponse = await examService.getExamAnalysis(parseInt(examId!), user.id);
      
      if (analysisResponse.status === 'success' && analysisResponse.data) {
        setAnalysisData(analysisResponse.data);
        setShowAnalysis(true);
      } else {
        console.error('Analysis failed:', analysisResponse.error);
        setError(analysisResponse.error || 'Analiz verileri alınamadı');
      }
    } catch (err) {
      console.error('Error loading analysis:', err);
      setError('Analiz verileri yüklenirken hata oluştu');
    } finally {
      setAnalysisLoading(false);
    }
  };

  const loadDetailedReview = async () => {
    try {
      setLoading(true);
      const reviewData = await examService.reviewPracticeExam(parseInt(examId!));
      
      // Transform backend data to frontend format
      const transformedQuestions = (reviewData.detailed_questions || []).map((question: any) => {
        console.log('Original question data:', question);
        
        // Build options array from individual option fields
        const options: Array<{
          id: string;
          text: string;
          label: string;
          is_correct: boolean;
        }> = [];
        const optionLabels = ['A', 'B', 'C', 'D', 'E'];
        const optionFields = ['option_a', 'option_b', 'option_c', 'option_d', 'option_e'];
        
        optionFields.forEach((fieldName, index) => {
          const optionText = question[fieldName];
          if (optionText && optionText.trim() !== '') {
            // Check if this option is the correct answer
            const correctAnswer = question.correct_answer;
            const isCorrect = correctAnswer && (
              // Letter matching: 'A', 'B', 'C', 'D', 'E'
              correctAnswer.toUpperCase() === optionLabels[index] ||
              // Number matching: '1', '2', '3', '4', '5' 
              correctAnswer.toString() === (index + 1).toString() ||
              // Direct text match
              correctAnswer.toString().trim().toLowerCase() === optionText.trim().toLowerCase() ||
              // Option field match (option_a, option_b, etc.)
              correctAnswer === fieldName ||
              // Index match (0, 1, 2, 3, 4)
              correctAnswer.toString() === index.toString()
            );
            
            options.push({
              id: optionLabels[index],
              text: optionText.trim(),
              label: optionLabels[index],
              is_correct: isCorrect
            });
          }
        });
        
        const transformedQuestion = {
          ...question,
          options
        };
        
        console.log('Transformed question:', transformedQuestion);
        console.log('User answer:', question.user_answer);
        console.log('Correct answer:', question.correct_answer);
        console.log('Is correct:', question.is_correct);
        
        return transformedQuestion;
      });
      
      setDetailedQuestions(transformedQuestions);
      setShowDetailedReview(true);
    } catch (err) {
      console.error('Error loading detailed review:', err);
      setError('Detaylı inceleme yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getGradeColor = (grade: string): string => {
    if (['A', 'A+'].includes(grade)) return 'bg-green-100 text-green-800';
    if (['B', 'B+'].includes(grade)) return 'bg-blue-100 text-blue-800';
    if (['C', 'C+'].includes(grade)) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading && !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="text-gray-600 mb-4">{error || 'Sonuçlar bulunamadı'}</p>
          <Button onClick={() => navigate('/app/practice-exam')}>
            Sınav Seçimine Dön
          </Button>
        </div>
      </div>
    );
  }

  if (showDetailedReview) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Detaylı Sınav İncelemesi
                </h1>
                <p className="text-gray-600">
                  {results?.exam?.name || 'Sınav Adı Bulunamadı'}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowDetailedReview(false)}
              >
                ← Özet Sonuçlara Dön
              </Button>
            </div>
          </div>

          {/* Questions Review */}
          <div className="space-y-6">
            {detailedQuestions.map((question, index) => (
              <div
                key={question.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Soru {index + 1}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    question.is_correct
                      ? 'bg-green-100 text-green-800'
                      : question.user_answer
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {question.is_correct ? 'Doğru' : question.user_answer ? 'Yanlış' : 'Boş'}
                  </div>
                </div>

                <div
                  className="text-gray-800 mb-4"
                  dangerouslySetInnerHTML={{ __html: question.question_text }}
                />

                <div className="space-y-2">
                  {question.options.map((option) => {
                    const isCorrect = option.is_correct;
                    const isUserAnswer = question.user_answer === option.id;
                    
                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-lg border ${
                          isCorrect
                            ? 'border-green-500 bg-green-50'
                            : isUserAnswer
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-600">
                            {option.label})
                          </span>
                          <span className="text-gray-800 flex-1">
                            {option.text}
                          </span>
                          {isCorrect && (
                            <span className="text-green-600 font-medium">✓ Doğru Cevap</span>
                          )}
                          {isUserAnswer && !isCorrect && (
                            <span className="text-red-600 font-medium">✗ Seçiminiz</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Section */}
                {question.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">
                      💡 Açıklama
                    </h4>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <Button onClick={() => navigate('/app/practice-exam')}>
              Yeni Sınav Çöz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Auto Analysis Animation Overlay */}
      {autoAnalysisRunning && (
        <AIAnalysisAnimation 
          stage={analysisStage} 
          progress={analysisProgress} 
        />
      )}
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sınav Sonuçları
          </h1>
          <p className="text-lg text-gray-600">
            {results?.exam?.name || 'Sınav Adı Bulunamadı'}
          </p>
        </div>

        {/* Score Summary */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(results?.exam?.score || 0)}`}>
              {(results?.exam?.score || 0).toFixed(1)}%
            </div>
            <div className={`inline-flex px-4 py-2 rounded-full text-lg font-medium mb-4 ${getGradeColor(results?.grade || 'F')}`}>
              {results?.grade || 'F'} Notu
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {results?.exam?.correct_answers || 0}
                </div>
                <div className="text-sm text-gray-600">Doğru</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {results?.exam?.wrong_answers || 0}
                </div>
                <div className="text-sm text-gray-600">Yanlış</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {results?.exam?.empty_answers || 0}
                </div>
                <div className="text-sm text-gray-600">Boş</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {results?.exam?.total_questions || 0}
                </div>
                <div className="text-sm text-gray-600">Toplam</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Performance Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performans İstatistikleri
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Doğruluk Oranı:</span>
                <span className="font-medium">
                  {(results?.statistics?.accuracy_rate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Soru Başına Süre:</span>
                <span className="font-medium">
                  {(results?.statistics?.time_per_question || 0).toFixed(1)} dk
                </span>
              </div>
              {results?.exam?.duration_minutes && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Toplam Süre:</span>
                  <span className="font-medium">
                    {results.exam.duration_minutes} dk
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Difficulty Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zorluk Seviyesi Performansı
            </h3>
            <div className="space-y-3">
              {Object.entries(results?.statistics?.difficulty_performance || {}).map(([level, score]) => (
                <div key={level} className="flex justify-between">
                  <span className="text-gray-600 capitalize">
                    {level === 'easy' ? 'Kolay' : level === 'medium' ? 'Orta' : 'Zor'}:
                  </span>
                  <span className={`font-medium ${getScoreColor(score as number)}`}>
                    {(score as number).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {(results?.recommendations?.length || 0) > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              📝 Öneriler
            </h3>
            <ul className="space-y-2 text-blue-800">
              {(results?.recommendations || []).map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Debug Panel (Temporary) */}
        <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🔍 Debug Bilgileri</h3>
          <div className="space-y-2 text-sm">
            <div>📊 Analysis Data: {analysisData ? '✅ Var' : '❌ Yok'}</div>
            <div>⚡ Parallel Processing: {parallelProcessing ? '✅ Var' : '❌ Yok'}</div>
            <div>👁️ Show Analysis: {showAnalysis ? '✅ Gösteriliyor' : '❌ Gizli'}</div>
            <div>🎯 YouTube/Book önerileri artık analysis objesi içinde</div>
            {state?.result && (
              <div className="mt-2 p-2 bg-white rounded border">
                <strong>State Result Keys:</strong> {Object.keys(state.result).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* Analysis Results */}
        {showAnalysis && analysisData && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  🧠 AI Analiz Sonuçları
                </h3>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAnalysis(false)}
                >
                  Gizle
                </Button>
              </div>
            </div>
            <ExamAnalysisResults 
              analysis={analysisData}
              examInfo={results ? {
                exam_id: results.exam.id,
                exam_type: results.exam.exam_type_name || 'Bilinmiyor',
                exam_section: results.exam.exam_section_name || 'Bilinmiyor',
                score: results.exam.score
              } : undefined}
            />
          </div>
        )}

        {/* Öneriler artık ExamAnalysisResults component'i içinde gösteriliyor */}
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!showAnalysis && !autoAnalysisRunning && (
            <Button
              onClick={loadAnalysisData}
              disabled={analysisLoading}
              variant="secondary"
              size="lg"
            >
              {analysisLoading ? 'Analiz ediliyor...' : '🔄 Analizi Tekrar Çalıştır'}
            </Button>
          )}
          
          {/* Önerileri Göster butonu kaldırıldı - artık ExamAnalysisResults component'i içinde */}
          
          <Button
            onClick={loadDetailedReview}
            disabled={loading}
            variant="secondary"
            size="lg"
          >
            {loading ? 'Yükleniyor...' : '📋 Detaylı İnceleme'}
          </Button>
          <Button
            onClick={() => navigate('/app/practice-exam')}
            size="lg"
          >
            🎯 Yeni Sınav Çöz
          </Button>
        </div>
        </div>
      </div>
    </>
  );
};

export default PracticeExamResultsPage;
