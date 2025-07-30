import React, { useCallback } from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle.ts';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useSEO, getPageSEOData, generateWebsiteStructuredData } from '../utils/seoUtils';
import { useContentManager } from '../utils/contentManager';
import { useLocalization } from '../utils/localization';
import { SkipLink } from '../components/ui/AccessibilityComponents';
import { LandingHeader } from '../components/landing/LandingHeader';
import { HeroSection } from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import StatisticsSection from '../components/landing/StatisticsSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import CTASection from '../components/landing/CTASection';
import FooterSection from '../components/landing/FooterSection';
import { 
  DynamicHero, 
  DynamicFeatures, 
  DynamicTestimonials, 
  DynamicStatistics,
  ContentSearch 
} from '../components/DynamicContent';
import ErrorBoundary from '../components/ErrorBoundary';
import ScrollProgressIndicator from '../components/ui/ScrollProgressIndicator';
import ScrollToTopButton from '../components/ui/ScrollToTopButton';
import type { LandingPageSEO } from '../types/seo.ts';

// SEO configuration for the landing page
const landingPageSEO: LandingPageSEO = {
  title: 'EduAI - AI-Powered Personalized Education Platform',
  description: 'Transform your learning experience with EduAI\'s AI-powered question generation, performance analysis, and personalized book recommendations. Join thousands of students improving their academic performance.',
  keywords: 'AI education, personalized learning, question generation, performance analysis, book recommendations, online learning platform',
  openGraph: {
    title: 'EduAI - AI-Powered Education Platform',
    description: 'Experience the future of personalized education with AI-powered learning tools',
    image: '/images/og-landing.jpg',
    url: window.location.origin,
  },
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'EduAI',
    description: 'AI-powered personalized education platform',
    url: window.location.origin,
    sameAs: [
      'https://twitter.com/eduai',
      'https://linkedin.com/company/eduai'
    ]
  }
};

export const LandingPage: React.FC = () => {
  // Content management utilities
  const { validateContent } = useContentManager();
  const { currentLanguage } = useLocalization();

  // Set document title and meta tags for legacy support
  useDocumentTitle(landingPageSEO);

  // Enhanced SEO with structured data
  const seoData = getPageSEOData('home', {
    structuredData: generateWebsiteStructuredData()
  });
  useSEO(seoData);

  // Monitor performance metrics
  const handleMetric = useCallback((metric: any) => {
    // In production, you could send metrics to analytics
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}: ${metric.value.toFixed(2)}ms`);
    }
  }, []);

  usePerformanceMonitor({
    enableLogging: process.env.NODE_ENV === 'development',
    onMetric: handleMetric
  });

  // Validate content on mount (development only)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const validation = validateContent();
      if (!validation.isValid) {
        console.warn('Content validation issues:', validation.errors);
      }
      console.log(`Current language: ${currentLanguage}`);
    }
  }, [validateContent, currentLanguage]);

  return (
    <div className="min-h-screen bg-white">
      {/* Skip Navigation for Accessibility */}
      <SkipLink href="#main-content">
        Ana içeriğe geç
      </SkipLink>
      
      {/* Scroll Progress Indicator with Enhanced Effects */}
      <ScrollProgressIndicator 
        showGlow={true}
        animated={true}
        height={4}
      />
      
      {/* Landing Page Header */}
      <LandingHeader />
      
      {/* Main Content with proper semantic markup */}
      <main id="main-content" className="pt-16 lg:pt-20">
        {/* Hero Section - Task 3 */}
        <HeroSection />
        
        {/* Features Section - Task 4 */}
        <FeaturesSection />
        
        {/* How It Works Section - Task 5 */}
        <HowItWorksSection />
        
        {/* Statistics Section - Task 6 */}
        <StatisticsSection />
        
        {/* Testimonials Section - Task 7 */}
        <TestimonialsSection />
        
        {/* CTA Section - Task 8 */}
        <CTASection />
        
        {/* Footer Section - Task 9 */}
        <FooterSection />
        
        <div className="container mx-auto px-4 py-8">
          {/* Development-only Content Management Demo */}
          {process.env.NODE_ENV === 'development' && (
            <ErrorBoundary
              fallback={
                <div className="mt-16 p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h2 className="text-xl font-semibold text-yellow-800 mb-2">
                    Dynamic Content Demo Error
                  </h2>
                  <p className="text-yellow-700">
                    The dynamic content demo encountered an error. This is expected during development as content loading is being optimized.
                  </p>
                </div>
              }
            >
              <div className="mt-16 space-y-16 border-t-4 border-yellow-500 pt-8">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                  📊 Dynamic Content Management Demo
                </h2>
                
                {/* Content Search Demo */}
                <section className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Content Search</h3>
                  <ContentSearch 
                    placeholder="Search features, testimonials, or workflow steps..."
                    className="max-w-md"
                  />
                </section>

                {/* Dynamic Hero Variants */}
                <section className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Hero Section Variants</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-medium mb-2">Social Proof Variant</h4>
                      <div className="border rounded-lg p-4 bg-white">
                        <DynamicHero variant="social-proof" showTrustIndicators={true} />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Focused Variant</h4>
                      <div className="border rounded-lg p-4 bg-white">
                        <DynamicHero variant="focused" showTrustIndicators={false} />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Dynamic Features Demo */}
                <section className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Dynamic Features</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Featured Only (Grid Layout)</h4>
                      <DynamicFeatures featured={true} limit={2} layout="grid" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">List Layout</h4>
                      <DynamicFeatures limit={2} layout="list" showStats={false} />
                    </div>
                  </div>
                </section>

                {/* Dynamic Testimonials Demo */}
                <section className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Dynamic Testimonials</h3>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Auto-rotating Carousel</h4>
                      <DynamicTestimonials 
                        limit={3} 
                        autoRotate={true} 
                        rotationInterval={3000}
                        featured={true}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Grid Layout</h4>
                      <DynamicTestimonials limit={2} autoRotate={false} />
                    </div>
                  </div>
                </section>

                {/* Dynamic Statistics Demo */}
                <section className="bg-gray-50 rounded-lg p-8">
                  <h3 className="text-xl font-semibold mb-4">Animated Statistics</h3>
                  <DynamicStatistics animate={true} duration={1500} />
                </section>
              </div>
            </ErrorBoundary>
          )}
          
          {/* Placeholder sections for upcoming tasks */}
          <div className="mt-16 space-y-16">
          </div>
        </div>
      </main>
      
      {/* Enhanced Scroll to Top Button */}
      <ScrollToTopButton 
        showProgress={true}
        animated={true}
        size="md"
      />
    </div>
  );
};

export default LandingPage;
