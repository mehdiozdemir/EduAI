import React from 'react';
import { CheckCircle, Clock, FileText, Target } from 'lucide-react';

interface ExamSubmitAnimationProps {
  stage: 'analyzing' | 'processing' | 'generating' | 'completed';
  progress: number;
}

const ExamSubmitAnimation: React.FC<ExamSubmitAnimationProps> = ({ stage, progress }) => {
  const getStageInfo = () => {
    switch (stage) {
      case 'analyzing':
        return {
          icon: <FileText className="w-8 h-8 text-blue-500" />,
          title: 'Sınav Değerlendiriliyor',
          description: 'Cevaplarınız kontrol ediliyor...',
          color: 'blue'
        };
      case 'processing':
        return {
          icon: <CheckCircle className="w-8 h-8 text-yellow-500" />,
          title: 'Sonuçlar Hesaplanıyor',
          description: 'Performansınız analiz ediliyor...',
          color: 'yellow'
        };
      case 'generating':
        return {
          icon: <Clock className="w-8 h-8 text-green-500" />,
          title: 'Kişisel Öneriler Hazırlanıyor',
          description: 'Size özel kaynaklar araştırılıyor...',
          color: 'green'
        };
      case 'completed':
        return {
          icon: <Target className="w-8 h-8 text-emerald-500" />,
          title: 'Sınav Tamamlandı!',
          description: 'Sonuçlarınız hazır, yönlendiriliyorsunuz...',
          color: 'emerald'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
        {/* Animated Icon */}
        <div className="relative mb-6">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 animate-pulse ${
            stageInfo.color === 'blue' ? 'bg-blue-100' :
            stageInfo.color === 'yellow' ? 'bg-yellow-100' :
            stageInfo.color === 'green' ? 'bg-green-100' :
            'bg-emerald-100'
          }`}>
            {stageInfo.icon}
          </div>
          
          {/* Rotating circles */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-24 h-24 border-4 rounded-full animate-spin ${
              stageInfo.color === 'blue' ? 'border-blue-200 border-t-blue-500' :
              stageInfo.color === 'yellow' ? 'border-yellow-200 border-t-yellow-500' :
              stageInfo.color === 'green' ? 'border-green-200 border-t-green-500' :
              'border-emerald-200 border-t-emerald-500'
            }`}></div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {stageInfo.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {stageInfo.description}
        </p>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ease-out ${
              stageInfo.color === 'blue' ? 'bg-blue-500' :
              stageInfo.color === 'yellow' ? 'bg-yellow-500' :
              stageInfo.color === 'green' ? 'bg-green-500' :
              'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Text */}
        <div className="text-sm text-gray-500">
          {progress}% tamamlandı
        </div>

        {/* Floating Icons Animation */}
        <div className="mt-6 flex justify-center gap-4 opacity-60">
          <div className="animate-bounce delay-100">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <div className="animate-bounce delay-300">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div className="animate-bounce delay-500">
            <Target className="w-5 h-5 text-purple-400" />
          </div>
        </div>

        {/* Processing Steps */}
        <div className="mt-6 space-y-2 text-left">
          <div className={`flex items-center gap-2 text-sm ${progress >= 25 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 25 ? '✅' : '⏳'} Cevaplar kontrol edildi
          </div>
          <div className={`flex items-center gap-2 text-sm ${progress >= 50 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 50 ? '✅' : '⏳'} Sonuçlar hesaplandı
          </div>
          <div className={`flex items-center gap-2 text-sm ${progress >= 75 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 75 ? '✅' : '⏳'} Öneriler hazırlanıyor
          </div>
          <div className={`flex items-center gap-2 text-sm ${progress >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
            {progress >= 100 ? '✅' : '⏳'} Analiz tamamlandı
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSubmitAnimation;