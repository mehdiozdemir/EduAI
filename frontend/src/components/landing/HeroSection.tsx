import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useFadeIn } from '../../hooks/useAnimations';
import { AuthAwareCTA } from './sections/AuthAwareCTA';
import { AuthAwareWelcome } from './sections/AuthAwareWelcome';

interface HeroSectionProps {
  className?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  // Animation hooks for staggered fade-in effects
  const badgeFade = useFadeIn(100);
  const titleFade = useFadeIn(300);
  const subtitleFade = useFadeIn(500);
  const buttonsFade = useFadeIn(700);
  const trustFade = useFadeIn(900);
  const visualFade = useFadeIn(400);

  return (
    <section 
      id="hero" 
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50',
        className
      )}
    >
      {/* Background gradient elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            {/* Hero badge */}
            <div className={cn(
              "inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-6 transition-all duration-700 ease-out",
              badgeFade.fadeInClass
            )}>
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
              Yapay Zeka Destekli Öğrenme Platformu
            </div>

            {/* Main heading and subheading */}
            <AuthAwareWelcome 
              className={cn(
                "transition-all duration-700 ease-out",
                titleFade.fadeInClass
              )}
              defaultTitle="Yapay Zeka ile Öğrenme Yolculuğunuzu Dönüştürün"
              defaultSubtitle="Yapay zeka destekli soru oluşturma, gerçek zamanlı performans analizi ve size özel akıllı kitap önerileriyle kişiselleştirilmiş eğitim deneyimi yaşayın."
            />

            {/* Key benefits */}
            <div className={cn(
              "flex flex-wrap justify-center lg:justify-start gap-4 mb-8 text-sm text-gray-600 transition-all duration-700 ease-out",
              subtitleFade.fadeInClass
            )}>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI Soru Üretimi
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Performans Analizi
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Kişisel Öneriler
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-4 justify-center lg:justify-start transition-all duration-700 ease-out",
              buttonsFade.fadeInClass
            )}>
              {/* Primary CTA */}
              <AuthAwareCTA 
                redirectPath="/app/dashboard"
                renderButton={({ onClick, isAuthenticated, user, isLoading }) => (
                  <button
                    onClick={onClick}
                    disabled={isLoading}
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-wait disabled:transform-none"
                  >
                    <span className="flex items-center">
                      {isLoading 
                        ? 'Yükleniyor...'
                        : isAuthenticated 
                          ? `Devam Et, ${user?.username || 'Kullanıcı'}`
                          : 'Hadi Başlayalım'
                      }
                      {!isLoading && (
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition-opacity -z-10" />
                  </button>
                )}
              />

              {/* Secondary CTA */}
              <Link
                to="#features"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 010 5H9m4.5-5H15a2.5 2.5 0 010 5h-1.5m-5-5v5m5-5v5" />
                </svg>
                Özellikleri Keşfet
              </Link>
            </div>
          </div>

          {/* Right side - Visual */}
          <div className={cn(
            "relative transition-all duration-1000 ease-out",
            visualFade.fadeInClass
          )}>
            {/* Placeholder for AI/Education illustration */}
            <div className="relative bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-8 shadow-2xl">
              {/* Mock dashboard/interface */}
              <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                    <div>
                      <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-2 bg-gray-100 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                
                {/* Mock content */}
                <div className="space-y-3">
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-full"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded w-1/2"></div>
                </div>

                {/* Mock chart */}
                <div className="mt-6 h-32 bg-gradient-to-t from-blue-50 to-purple-50 rounded-lg flex items-end justify-around p-4">
                  {[40, 70, 45, 80, 60].map((height, i) => (
                    <div
                      key={i}
                      className="bg-gradient-to-t from-blue-500 to-purple-600 rounded-t w-6 transition-all duration-1000 ease-out"
                      style={{ 
                        height: visualFade.isVisible ? `${height}%` : '0%',
                        transitionDelay: `${i * 100}ms`
                      }}
                    ></div>
                  ))}
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
              </div>

              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -z-10 top-8 -right-8 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl"></div>
            <div className="absolute -z-10 -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr from-purple-400/10 to-blue-600/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
