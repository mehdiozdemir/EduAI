import React from 'react';
import FeatureCard, { type Feature } from './FeatureCard';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import {
  QuestionGenerationIcon,
  PerformanceAnalysisIcon,
  BookRecommendationIcon,
  PersonalizedLearningIcon,
} from '../icons/FeatureIcons';
import { AuthAwareCTA } from './sections/AuthAwareCTA';

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
    title: 'Kitap Önerileri',
    description: 'Performansınıza göre size en uygun kaynak kitapları önerir. Her seviyeye ve her konuya özel kitap listesi sunar.',
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

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ 
          transitionDelay: isVisible ? '800ms' : '0ms' 
        }}>
          <p className="text-gray-600 mb-6">
            Daha fazla özellik keşfetmek için platforma göz atın
          </p>
          <AuthAwareCTA 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform-gpu group"
            redirectPath="/features"
          >
            Tüm Özellikleri Keşfet
            <svg className="ml-2 -mr-1 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </AuthAwareCTA>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
