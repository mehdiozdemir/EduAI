import React from 'react';
import WorkflowStepComponent, { type WorkflowStep } from './WorkflowStep';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import {
  RegistrationIcon,
  SubjectSelectionIcon,
  AIQuestionSolvingIcon,
  PerformanceTrackingIcon,
  PersonalizedRecommendationsIcon,
} from '../icons/WorkflowIcons';

const workflowSteps: WorkflowStep[] = [
  {
    id: 'registration',
    number: 1,
    title: 'Kayıt Olun',
    description: 'Hızlı ve kolay kayıt işlemiyle EduAI ailesine katılın. E-posta adresinizle birkaç dakikada hesabınızı oluşturun.',
    icon: <RegistrationIcon />,
    color: 'blue',
  },
  {
    id: 'subject-selection',
    number: 2,
    title: 'Eğitim Seviyenizi Seçin',
    description: 'Eğitim seviyenizi seçin ardından ders veya deneme sınavına geçin.',
    icon: <SubjectSelectionIcon />,
    color: 'green',
  },
  {
    id: 'ai-question-solving',
    number: 3,
    title: 'AI Destekli Soru Çözme ve Deneme Sıanvı',
    description: ' Matematik, fizik, kimya ve daha birçok dersten size uygun olanları belirleyin. Yapay zeka tarafından üretilen sorularla pratik yapın. Zorluğu ve konuyu siz belirleyin, AI size özel sorular hazırlasın.',
    icon: <AIQuestionSolvingIcon />,
    color: 'purple',
  },
  {
    id: 'performance-tracking',
    number: 4,
    title: 'Performans Takibi',
    description: 'Detaylı raporlar ile ilerlemenizi takip edin. Güçlü ve zayıf yönlerinizi keşfedin, hedefinize odaklanın.',
    icon: <PerformanceTrackingIcon />,
    color: 'orange',
  },
  {
    id: 'personalized-recommendations',
    number: 5,
    title: 'AI Destekli Kişiselleştirilmiş Öneriler',
    description: 'Performansınıza göre size özel çalışma kitapları ve video önerileri alın. AI, öğrenme tarzınıza uygun içerikleri seçer.',
    icon: <PersonalizedRecommendationsIcon />,
    color: 'indigo',
  },
];

interface HowItWorksSectionProps {
  className?: string;
}

const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ className = '' }) => {
  const { isVisible, ref: fadeInRef } = useIntersectionAnimation();

  return (
    <section
      id="how-it-works"
      className={`py-16 px-4 sm:px-6 lg:px-8 bg-white ${className}`}
      ref={fadeInRef}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            EduAI ile öğrenme yolculuğunuz sadece 5 adımda başlar.
            Basit adımlarla kişiselleştirilmiş eğitim deneyiminizi oluşturun.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Mobile/Tablet Layout - Vertical Timeline */}
          <div className="lg:hidden space-y-0">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`transition-all duration-700 ${isVisible
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 translate-x-8'
                  }`}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 200}ms` : '0ms'
                }}
              >
                <WorkflowStepComponent
                  step={step}
                  isLast={index === workflowSteps.length - 1}
                  animationDelay={200 + index * 200}
                />
              </div>
            ))}
          </div>

          {/* Desktop Layout - Horizontal Timeline */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-6 relative">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`transition-all duration-700 ${isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
                  }`}
                style={{
                  transitionDelay: isVisible ? `${200 + index * 150}ms` : '0ms'
                }}
              >
                <WorkflowStepComponent
                  step={step}
                  isLast={index === workflowSteps.length - 1}
                  animationDelay={200 + index * 150}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className={`text-center mt-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{
            transitionDelay: isVisible ? '1000ms' : '0ms'
          }}>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
