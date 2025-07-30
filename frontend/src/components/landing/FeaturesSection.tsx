import React from 'react';
import FeatureCard, { type Feature } from './FeatureCard';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import {
  QuestionGenerationIcon,
  PerformanceAnalysisIcon,
  BookRecommendationIcon,
  PersonalizedLearningIcon,
} from '../icons/FeatureIcons';

const features: Feature[] = [
  {
    id: 'question-generation',
    title: 'AI Soru Üretimi',
    description: 'Yapay zeka ile konularınıza özel sorular üretir, zorluğu siz belirlersiniz. Her soru, öğrenme hedefinize özel olarak tasarlanır.',
    icon: <QuestionGenerationIcon />,
    color: 'blue',
  },
  {
    id: 'performance-analysis',
    title: 'Performans Analizi',
    description: 'Detaylı raporlar ile güçlü ve zayıf yönlerinizi keşfedin. AI analizleriyle hangi konularda daha fazla çalışmanız gerektiğini öğrenin.',
    icon: <PerformanceAnalysisIcon />,
    color: 'green',
  },
  {
    id: 'book-recommendations',
    title: 'Kitap ve YouTube Video Önerileri',
    description: 'Performansınıza göre size en uygun kaynak kitapları ve youtube videoları önerir. Her seviyeye ve her konuya özel kitap listesi ve youtube videoları sunar.',
    icon: <BookRecommendationIcon />,
    color: 'purple',
  },
  {
    id: 'personalized-learning',
    title: 'Kişiselleştirilmiş Öğrenme',
    description: 'Öğrenme tarzınıza ve hızınıza göre uyarlanmış deneyim. Her öğrenci için benzersiz bir eğitim yolculuğu oluşturur.',
    icon: <PersonalizedLearningIcon />,
    color: 'orange',
  },
];

interface FeaturesSectionProps {
  className?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className = '' }) => {
  const { isVisible, ref: fadeInRef } = useIntersectionAnimation();

  return (
    <section 
      id="features" 
      className={`py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 ${className}`}
      ref={fadeInRef}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Özellikler
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            EduAI ile eğitiminizi kişiselleştirin. Yapay zeka destekli özelliklerimiz ile 
            öğrenme deneyiminizi optimize edin ve hedeflerinize daha hızlı ulaşın.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.id}
              className={`transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: isVisible ? `${100 + index * 150}ms` : '0ms' 
              }}
            >
              <FeatureCard
                feature={feature}
                animationDelay={100 + index * 150}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
