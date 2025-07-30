import React from 'react';
import { useEffect } from 'react';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: object;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Hook for managing document head SEO elements
 */
export const useSEO = (seoData: SEOData) => {
  useEffect(() => {
    // Set document title
    document.title = seoData.title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Basic meta tags
    updateMetaTag('description', seoData.description);
    if (seoData.keywords) {
      updateMetaTag('keywords', seoData.keywords);
    }

    // Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle || seoData.title, true);
    updateMetaTag('og:description', seoData.ogDescription || seoData.description, true);
    updateMetaTag('og:type', 'website', true);
    
    if (seoData.ogImage) {
      updateMetaTag('og:image', seoData.ogImage, true);
    }
    if (seoData.ogUrl) {
      updateMetaTag('og:url', seoData.ogUrl, true);
    }

    // Twitter Card tags
    updateMetaTag('twitter:card', seoData.twitterCard || 'summary_large_image');
    if (seoData.twitterSite) {
      updateMetaTag('twitter:site', seoData.twitterSite);
    }
    if (seoData.twitterCreator) {
      updateMetaTag('twitter:creator', seoData.twitterCreator);
    }

    // Robots meta tag
    const robotsContent = [];
    if (seoData.noindex) robotsContent.push('noindex');
    if (seoData.nofollow) robotsContent.push('nofollow');
    if (robotsContent.length === 0) robotsContent.push('index', 'follow');
    updateMetaTag('robots', robotsContent.join(', '));

    // Canonical link
    if (seoData.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink) {
        canonicalLink.setAttribute('href', seoData.canonical);
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', seoData.canonical);
        document.head.appendChild(canonicalLink);
      }
    }

    // Structured Data
    if (seoData.structuredData) {
      let structuredDataScript = document.querySelector('#structured-data') as HTMLScriptElement;
      if (structuredDataScript) {
        structuredDataScript.textContent = JSON.stringify(seoData.structuredData);
      } else {
        structuredDataScript = document.createElement('script');
        structuredDataScript.id = 'structured-data';
        structuredDataScript.type = 'application/ld+json';
        structuredDataScript.textContent = JSON.stringify(seoData.structuredData);
        document.head.appendChild(structuredDataScript);
      }
    }

  }, [seoData]);
};

/**
 * Structured Data component for rich snippets
 */
interface StructuredDataProps {
  data: object;
}

export const StructuredData: React.FC<StructuredDataProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

/**
 * Breadcrumb structured data
 */
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export const generateBreadcrumbStructuredData = (items: BreadcrumbItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Organization structured data
 */
export const generateOrganizationStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'EduAI',
    description: 'AI-powered personalized education platform',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    foundingDate: '2025',
    email: 'info@eduai.com',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'Istanbul'
    },
    sameAs: [
      'https://twitter.com/eduai',
      'https://facebook.com/eduai',
      'https://linkedin.com/company/eduai'
    ],
    offers: {
      '@type': 'Offer',
      category: 'Education',
      availability: 'https://schema.org/InStock'
    }
  };
};

/**
 * Article structured data
 */
export const generateArticleStructuredData = (article: {
  title: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'EduAI',
      logo: {
        '@type': 'ImageObject',
        url: `${window.location.origin}/logo.png`
      }
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    image: article.image ? [article.image] : undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href
    }
  };
};

/**
 * FAQ structured data
 */
export interface FAQItem {
  question: string;
  answer: string;
}

export const generateFAQStructuredData = (faqs: FAQItem[]) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
};

/**
 * Website structured data
 */
export const generateWebsiteStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'EduAI',
    description: 'AI-powered personalized education platform',
    url: window.location.origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${window.location.origin}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Service structured data
 */
export const generateServiceStructuredData = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'AI-Powered Education Platform',
    description: 'Personalized learning experience with AI-generated questions and performance analysis',
    provider: {
      '@type': 'Organization',
      name: 'EduAI'
    },
    serviceType: 'Educational Technology',
    areaServed: 'Turkey',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'EduAI Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'AI Question Generation',
            description: 'Automatic generation of personalized learning questions'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Performance Analysis',
            description: 'Detailed analysis of learning progress and performance metrics'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Book Recommendations',
            description: 'AI-powered personalized book recommendations for enhanced learning'
          }
        }
      ]
    }
  };
};

/**
 * Meta tags for different page types
 */
export const getPageSEOData = (pageType: string, customData?: Partial<SEOData>): SEOData => {
  const baseUrl = window.location.origin;
  
  const defaults: Record<string, SEOData> = {
    home: {
      title: 'EduAI - AI-Powered Personalized Education Platform',
      description: 'Transform your learning with EduAI\'s AI-powered question generation, performance analysis, and personalized book recommendations. Join thousands of students improving their academic performance.',
      keywords: 'AI education, personalized learning, question generation, performance analysis, book recommendations, online learning platform, artificial intelligence, education technology',
      canonical: baseUrl,
      ogTitle: 'EduAI - AI-Powered Education Platform',
      ogDescription: 'Experience the future of personalized education with AI-powered learning tools',
      ogImage: `${baseUrl}/images/og-home.jpg`,
      ogUrl: baseUrl,
      twitterCard: 'summary_large_image',
      twitterSite: '@eduai',
      structuredData: generateOrganizationStructuredData()
    },
    about: {
      title: 'About EduAI - AI-Powered Education Platform',
      description: 'Learn about EduAI\'s mission to revolutionize education through artificial intelligence and personalized learning experiences.',
      keywords: 'about EduAI, education technology, AI learning platform, personalized education',
      canonical: `${baseUrl}/about`,
      ogTitle: 'About EduAI',
      ogDescription: 'Revolutionizing education through AI-powered personalized learning',
      ogUrl: `${baseUrl}/about`
    },
    pricing: {
      title: 'EduAI Pricing - Affordable AI-Powered Education Plans',
      description: 'Choose the perfect EduAI plan for your learning needs. Affordable pricing for AI-powered question generation, performance analysis, and personalized recommendations.',
      keywords: 'EduAI pricing, education plans, AI learning costs, affordable education technology',
      canonical: `${baseUrl}/pricing`,
      ogTitle: 'EduAI Pricing Plans',
      ogDescription: 'Affordable AI-powered education plans for every learner',
      ogUrl: `${baseUrl}/pricing`,
      structuredData: generateServiceStructuredData()
    }
  };

  const baseData = defaults[pageType] || defaults.home;
  return { ...baseData, ...customData };
};

/**
 * Accessibility and SEO best practices checker
 */
export const checkSEOCompliance = () => {
  const issues = [];

  // Check for missing title
  if (!document.title || document.title.length === 0) {
    issues.push('Missing page title');
  }

  // Check title length
  if (document.title && document.title.length > 60) {
    issues.push('Page title too long (>60 characters)');
  }

  // Check for missing meta description
  const description = document.querySelector('meta[name="description"]');
  if (!description) {
    issues.push('Missing meta description');
  } else {
    const content = description.getAttribute('content');
    if (!content || content.length === 0) {
      issues.push('Empty meta description');
    }
    if (content && content.length > 160) {
      issues.push('Meta description too long (>160 characters)');
    }
  }

  // Check for missing h1
  const h1Elements = document.querySelectorAll('h1');
  if (h1Elements.length === 0) {
    issues.push('Missing H1 tag');
  }
  if (h1Elements.length > 1) {
    issues.push('Multiple H1 tags found');
  }

  // Check for missing alt text on images
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.getAttribute('alt')) {
      issues.push(`Image ${index + 1} missing alt text`);
    }
  });

  // Check for proper heading hierarchy
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    if (index > 0 && currentLevel > previousLevel + 1) {
      issues.push(`Heading hierarchy skip from H${previousLevel} to H${currentLevel}`);
    }
    previousLevel = currentLevel;
  });

  return issues;
};

export default {
  useSEO,
  StructuredData,
  generateBreadcrumbStructuredData,
  generateOrganizationStructuredData,
  generateArticleStructuredData,
  generateFAQStructuredData,
  generateWebsiteStructuredData,
  generateServiceStructuredData,
  getPageSEOData,
  checkSEOCompliance
};
