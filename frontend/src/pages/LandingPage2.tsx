import React from 'react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { LandingHeader } from '../components/landing/LandingHeader';
import type { LandingPageSEO } from '../types/seo';

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
  // Set document title and meta tags
  useDocumentTitle(landingPageSEO);

  return (
    <div className="min-h-screen bg-white">
      {/* Landing Page Header */}
      <LandingHeader />
      
      {/* Main landing page content will be implemented in subsequent tasks */}
      <div className="pt-16 lg:pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              EduAI - AI-Powered Education
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Transform your learning experience with personalized AI-powered education tools
            </p>
          </div>
          
          {/* Placeholder sections for upcoming tasks */}
          <div className="mt-16 space-y-16">
            {/* Hero Section - Task 3 */}
            <section id="hero" className="py-16 bg-gray-50 rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Hero Section</h2>
                <p className="text-gray-600">Will be implemented in Task 3</p>
              </div>
            </section>

            {/* Features Section - Task 4 */}
            <section id="features" className="py-16">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Features Section</h2>
                <p className="text-gray-600">Will be implemented in Task 4</p>
              </div>
            </section>

            {/* How It Works Section - Task 5 */}
            <section id="how-it-works" className="py-16 bg-gray-50 rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">How It Works Section</h2>
                <p className="text-gray-600">Will be implemented in Task 5</p>
              </div>
            </section>

            {/* Statistics Section - Task 6 */}
            <section id="statistics" className="py-16">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Statistics Section</h2>
                <p className="text-gray-600">Will be implemented in Task 6</p>
              </div>
            </section>

            {/* Testimonials Section - Task 7 */}
            <section id="testimonials" className="py-16 bg-gray-50 rounded-lg">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Testimonials Section</h2>
                <p className="text-gray-600">Will be implemented in Task 7</p>
              </div>
            </section>

            {/* CTA Section - Task 8 */}
            <section id="cta" className="py-16">
              <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Call to Action Section</h2>
                <p className="text-gray-600">Will be implemented in Task 8</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
