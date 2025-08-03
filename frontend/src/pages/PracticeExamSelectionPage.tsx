import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { examService, type ExamType, type ExamSection } from '../services/examService';
import Button from '../components/ui/Button';
import { Loading } from '../components/ui/Loading';

const PracticeExamSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);
  const [examSections, setExamSections] = useState<ExamSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<ExamSection | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'type' | 'section' | 'confirm'>('type');

  // Load exam types on mount
  useEffect(() => {
    loadExamTypes();
  }, []);

  const loadExamTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const types = await examService.getExamTypes();
      setExamTypes(types);
    } catch (err) {
      console.error('Error loading exam types:', err);
      setError('Sınav türleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectExamType = async (examType: ExamType) => {
    try {
      setLoading(true);
      setError(null);
      setSelectedExamType(examType);
      
      const sections = await examService.getExamSections(examType.id);
      setExamSections(sections);
      setStep('section');
    } catch (err) {
      console.error('Error loading exam sections:', err);
      setError('Sınav bölümleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const selectSection = (section: ExamSection) => {
    setSelectedSection(section);
    setStep('confirm');
  };

  const startExam = async (forceNew: boolean = false) => {
    if (!selectedSection) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Starting exam with params:', {
        exam_section_id: selectedSection.id,
        use_existing: !forceNew,
        force_new: forceNew
      });

      const result = await examService.startPracticeExam(
        { exam_section_id: selectedSection.id },
        !forceNew, // use_existing: mevcut sınavları kullan (force_new'in tersi)
        forceNew   // force_new: yeni sınav zorla üret
      );

      console.log('✅ Exam started:', result);

      // Navigate to the exam page
      navigate(`/app/practice-exam/${result.exam_id}`, {
        state: {
          examName: result.exam_name,
          totalQuestions: result.total_questions,
          isNewExam: result.status === 'not_started'
        }
      });
    } catch (err) {
      console.error('Error starting exam:', err);
      setError('Sınav başlatılırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'section') {
      setStep('type');
      setSelectedExamType(null);
      setExamSections([]);
    } else if (step === 'confirm') {
      setStep('section');
      setSelectedSection(null);
    }
  };

  if (loading && step === 'type') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Deneme Sınavı
          </h1>
          <p className="text-lg text-gray-600">
            {step === 'type' && 'Sınav türünü seçin'}
            {step === 'section' && 'Sınav bölümünü seçin'}
            {step === 'confirm' && 'Sınav başlatılıyor'}
          </p>
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'type' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <span className="text-sm text-gray-500">Sınav Türü</span>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'section' ? 'bg-blue-600 text-white' : 
              step === 'confirm' ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
            <span className="text-sm text-gray-500">Sınav Bölümü</span>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              3
            </div>
            <span className="text-sm text-gray-500">Başlat</span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
            <button 
              onClick={() => setError(null)} 
              className="ml-2 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Step 1: Exam Type Selection */}
        {step === 'type' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examTypes.map((examType) => (
                <div
                  key={examType.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => selectExamType(examType)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {examType.name}
                    </h3>
                    <div className="text-sm text-blue-600 font-medium">
                      {examType.sections_count} bölüm
                    </div>
                  </div>
                  {examType.description && (
                    <p className="text-gray-600 mb-4">
                      {examType.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {examType.duration_minutes ? `${examType.duration_minutes} dakika` : 'Süre belirtilmemiş'}
                    </span>
                    <div className="text-blue-600 font-medium">
                      Seç →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Section Selection */}
        {step === 'section' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedExamType?.name} - Bölüm Seçimi
                </h2>
                <p className="text-gray-600">
                  Hangi bölümde sınava girmek istiyorsunuz?
                </p>
              </div>
              <Button 
                variant="secondary" 
                onClick={goBack}
                disabled={loading}
              >
                ← Geri
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {examSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                  onClick={() => selectSection(section)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{section.icon || '📚'}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {section.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {section.question_count || section.total_questions || 'N/A'} soru
                        </p>
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium text-sm">
                      Seç →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 'confirm' && selectedSection && (
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-4xl">{selectedSection.icon || '📚'}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sınav Seçenekleri
                </h2>
                <p className="text-gray-600 mb-6">
                  <strong>{selectedExamType?.name}</strong> - <strong>{selectedSection.name}</strong>
                  <br />
                  {selectedSection.question_count || selectedSection.total_questions} soru
                  <br />
                  <span className="text-sm text-gray-500 mt-2 block">
                    Mevcut sınavınızı devam ettirebilir veya yeni sorularla fresh bir sınav oluşturabilirsiniz.
                  </span>
                </p>
                
                <div className="space-y-4">
                  <Button
                    onClick={() => startExam(false)}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Sınav Hazırlanıyor...' : '🔄 Mevcut Sınavı Kullan'}
                  </Button>
                  
                  <Button
                    onClick={() => startExam(true)}
                    disabled={loading}
                    className="w-full"
                    variant="secondary"
                    size="lg"
                  >
                    {loading ? 'Yeni Sınav Üretiliyor...' : '✨ Yeni Sınav Üret'}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={goBack}
                    disabled={loading}
                    className="w-full"
                  >
                    Bölümü Değiştir
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeExamSelectionPage;
