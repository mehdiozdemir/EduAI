import { useEffect } from 'react';
import type { SEOConfig } from '../types/seo';

/**
 * Custom hook for managing document title and meta tags
 * Provides SEO optimization for the landing page
 */
export const useDocumentTitle = (seoConfig: SEOConfig) => {
  useEffect(() => {
    // Set document title
    if (seoConfig.title) {
      document.title = seoConfig.title;
    }

    // Get or create meta tags
    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (metaTag) {
        metaTag.setAttribute('content', content);
      } else {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, name);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    // Set basic meta tags
    if (seoConfig.description) {
      setMetaTag('description', seoConfig.description);
    }

    if (seoConfig.keywords) {
      setMetaTag('keywords', seoConfig.keywords);
    }

    // Set Open Graph meta tags
    if (seoConfig.openGraph) {
      const og = seoConfig.openGraph;
      setMetaTag('og:title', og.title, true);
      setMetaTag('og:description', og.description, true);
      setMetaTag('og:type', og.type || 'website', true);
      
      if (og.image) {
        setMetaTag('og:image', og.image, true);
      }
      
      if (og.url) {
        setMetaTag('og:url', og.url, true);
      }

      if (og.siteName) {
        setMetaTag('og:site_name', og.siteName, true);
      }
    }

    // Set Twitter Card meta tags
    if (seoConfig.openGraph) {
      setMetaTag('twitter:card', 'summary_large_image');
      setMetaTag('twitter:title', seoConfig.openGraph.title);
      setMetaTag('twitter:description', seoConfig.openGraph.description);
      
      if (seoConfig.openGraph.image) {
        setMetaTag('twitter:image', seoConfig.openGraph.image);
      }
    }

    // Set robots meta tag
    const robotsContent = [];
    if (seoConfig.noIndex) robotsContent.push('noindex');
    if (seoConfig.noFollow) robotsContent.push('nofollow');
    
    if (robotsContent.length > 0) {
      setMetaTag('robots', robotsContent.join(', '));
    } else {
      setMetaTag('robots', 'index, follow');
    }

    // Set canonical URL
    if (seoConfig.canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      
      if (canonicalLink) {
        canonicalLink.href = seoConfig.canonical;
      } else {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        canonicalLink.href = seoConfig.canonical;
        document.head.appendChild(canonicalLink);
      }
    }

    // Add structured data (JSON-LD)
    if (seoConfig.structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
      
      if (structuredDataScript) {
        structuredDataScript.textContent = JSON.stringify(seoConfig.structuredData);
      } else {
        structuredDataScript = document.createElement('script');
        structuredDataScript.type = 'application/ld+json';
        structuredDataScript.textContent = JSON.stringify(seoConfig.structuredData);
        document.head.appendChild(structuredDataScript);
      }
    }

    // Cleanup function to restore original title
    const originalTitle = document.title;
    
    return () => {
      // Note: In a real app, you might want to restore the original meta tags
      // For now, we'll just restore the title
      if (originalTitle && originalTitle !== seoConfig.title) {
        document.title = originalTitle;
      }
    };
  }, [seoConfig]);
};

/**
 * Simple hook for just setting document title
 */
export const useTitle = (title: string) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
