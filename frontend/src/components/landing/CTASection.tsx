import React from 'react';
import { useIntersectionAnimation } from '../../hooks/useAnimations';
import { cn } from '../../utils';
import { AuthAwareCTA } from './sections/AuthAwareCTA';

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

          {/* Urgency Elements / Social Proof */}
          <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: isVisible ? '200ms' : '0ms' }}>
            
            {/* Users Count */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="flex -space-x-2 mr-3">
                {/* User Avatars */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                  A
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                  M
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                  Z
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white text-xs font-semibold">
                  +25K
                </div>
              </div>
              <span className="text-white text-sm font-medium">
                25,000+ öğrenci şu an aktif
              </span>
            </div>

            {/* Rating */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <div className="flex space-x-1 mr-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-white text-sm font-medium">
                4.9/5 kullanıcı memnuniyeti
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: isVisible ? '400ms' : '0ms' }}>
            
            {/* Primary CTA - Sign Up */}
            <AuthAwareCTA 
              redirectPath="/app/dashboard"
              renderButton={({ onClick, isAuthenticated, user, isLoading }) => (
                <button 
                  onClick={onClick}
                  disabled={isLoading}
                  className={cn(
                    'group relative px-8 py-4 text-lg font-semibold rounded-xl',
                    'bg-white text-blue-600 hover:bg-gray-50',
                    'transform hover:scale-105 hover:-translate-y-1',
                    'transition-all duration-300 shadow-xl hover:shadow-2xl',
                    'focus:outline-none focus:ring-4 focus:ring-white/50',
                    'min-w-[200px] flex items-center justify-center',
                    'disabled:opacity-50 disabled:cursor-wait disabled:transform-none'
                  )}
                >
                  <span className="relative z-10">
                    {isLoading 
                      ? 'Yükleniyor...'
                      : isAuthenticated 
                        ? `Devam Et, ${user?.username || 'Kullanıcı'}`
                        : 'Ücretsiz Başla'
                    }
                  </span>
                  {!isLoading && (
                    <svg className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                  
                  {/* Button Shine Effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </button>
              )}
            />

            {/* Secondary CTA - Learn More */}
            <button className={cn(
              'group px-8 py-4 text-lg font-semibold rounded-xl',
              'border-2 border-white/30 text-white hover:border-white hover:bg-white/10',
              'backdrop-blur-sm transition-all duration-300',
              'focus:outline-none focus:ring-4 focus:ring-white/50',
              'min-w-[200px] flex items-center justify-center'
            )}>
              <svg className="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>Demo İzle</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className={`transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`} style={{ transitionDelay: isVisible ? '600ms' : '0ms' }}>
            <p className="text-blue-200 text-sm mb-6">
              ✓ Kredi kartı gerekmez • ✓ 7 gün ücretsiz deneme • ✓ İstediğin zaman iptal et
            </p>
            
            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-sm">SSL Güvencesi</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-sm">Güvenli Ödeme</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12a3 3 0 003-3 3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-2 7.5V16a1 1 0 01-1 1H6a1 1 0 01-1-1v-2.5A4 4 0 0110 5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white text-sm">7/24 Destek</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CTASection;
