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
import CTASection from '../components/landing/CTASection';
import FooterSection from '../components/landing/FooterSection';
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
        
        {/* CTA Section - Task 8 */}
        <CTASection />
        
        {/* Footer Section - Task 9 */}
        <FooterSection />
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
