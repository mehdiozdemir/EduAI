import React from 'react';
import { useIntersectionAnimation } from '../../hooks/useAnimations';

interface CTASectionProps {
  className?: string;
}

const CTASection: React.FC<CTASectionProps> = ({ className = '' }) => {
  const { isVisible, ref: fadeInRef } = useIntersectionAnimation();

  return (
    <section 
      id="cta" 
      className={`py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`}
      ref={fadeInRef}
    >
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-300/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-40 h-40 bg-blue-300/5 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`text-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          
          {/* Main Heading */}
          <div className="mb-8">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              EduAI ile Geleceğini
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Şekillendir
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              Yapay zeka destekli eğitim platformuna bugün katıl ve 
              öğrenme yolculuğunda farkı hemen yaşamaya başla.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
