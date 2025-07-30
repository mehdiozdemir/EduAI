import React from 'react';
import WorkflowStepComponent, { type WorkflowStep } from './WorkflowStep';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import {
  RegistrationIcon,
  SubjectSelectionIcon,
  AIQuestionSolvingIcon,
  PerformanceTrackingIcon,
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
    title: 'Konu Seçimi Yapın',
    description: 'Çalışmak istediğiniz konuları seçin. Matematik, fizik, kimya ve daha birçok dersten size uygun olanları belirleyin.',
    icon: <SubjectSelectionIcon />,
    color: 'green',
  },
  {
    id: 'ai-question-solving',
    number: 3,
    title: 'AI Destekli Soru Çözme',
    description: 'Yapay zeka tarafından üretilen sorularla pratik yapın. Zorluğu ve konuyu siz belirleyin, AI size özel sorular hazırlasın.',
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
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Nasıl Çalışır?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            EduAI ile öğrenme yolculuğunuz sadece 4 adımda başlar. 
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
                className={`transition-all duration-700 ${
                  isVisible 
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
          <div className="hidden lg:grid lg:grid-cols-4 lg:gap-8 relative">
            {workflowSteps.map((step, index) => (
              <div
                key={step.id}
                className={`transition-all duration-700 ${
                  isVisible 
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
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ 
          transitionDelay: isVisible ? '1000ms' : '0ms' 
        }}>
          <p className="text-gray-600 mb-6">
            Hemen başlayın ve AI destekli öğrenme deneyimini keşfedin
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform-gpu">
              Ücretsiz Başla
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
              Demo İzle
              <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
