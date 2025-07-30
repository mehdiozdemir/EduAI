import React from 'react';
import StatCard, { type Statistic } from './StatCard';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import {
  UsersIcon,
  QuestionsSolvedIcon,
  SuccessRateIcon,
  LearningHoursIcon,
} from '../icons/StatIcons';

const statistics: Statistic[] = [
  {
    id: 'users',
    value: 25000,
    label: 'Aktif Kullanıcı',
    suffix: '+',
    icon: <UsersIcon />,
    description: 'EduAI ile öğrenme yolculuğuna devam eden öğrenci sayısı',
  },
  {
    id: 'questions',
    value: 1250000,
    label: 'Çözülen Soru',
    suffix: '+',
    icon: <QuestionsSolvedIcon />,
    description: 'Platform üzerinde başarıyla çözülen toplam soru sayısı',
  },
  {
    id: 'success-rate',
    value: 87,
    label: 'Başarı Oranı',
    suffix: '%',
    icon: <SuccessRateIcon />,
    description: 'Kullanıcılarımızın ortalama soru çözme başarı oranı',
  },
  {
    id: 'learning-hours',
    value: 180000,
    label: 'Öğrenme Saati',
    suffix: '+',
    icon: <LearningHoursIcon />,
    description: 'Platform üzerinde geçirilen toplam öğrenme süresi',
  },
];

interface StatisticsSectionProps {
  className?: string;
}

const StatisticsSection: React.FC<StatisticsSectionProps> = ({ className = '' }) => {
  const { isVisible, ref: fadeInRef } = useIntersectionAnimation();

  return (
    <section 
      id="statistics" 
      className={`py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 ${className}`}
      ref={fadeInRef}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className={`text-center mb-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Rakamlarla EduAI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Binlerce öğrenci EduAI ile hedeflerine ulaşıyor. 
            Siz de bu başarı hikayesinin bir parçası olun.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {statistics.map((stat, index) => (
            <div
              key={stat.id}
              className={`transition-all duration-700 ${
                isVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ 
                transitionDelay: isVisible ? `${200 + index * 150}ms` : '0ms' 
              }}
            >
              <StatCard
                stat={stat}
                isVisible={isVisible}
                animationDelay={200 + index * 150}
              />
            </div>
          ))}
        </div>

        {/* Bottom Message */}
        <div className={`text-center mt-16 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`} style={{ 
          transitionDelay: isVisible ? '1000ms' : '0ms' 
        }}>
          <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Siz de bu başarının parçası olun
                </h3>
                <p className="text-gray-600">
                  Binlerce öğrenci gibi AI destekli öğrenme deneyimini yaşayın ve hedeflerinize daha hızlı ulaşın.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                <button className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform-gpu">
                  Hemen Başla
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200">
                  İletişime Geç
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatisticsSection;
