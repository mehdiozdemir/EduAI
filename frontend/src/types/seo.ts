// SEO-related type definitions for the landing page

export interface OpenGraphData {
  title: string;
  description: string;
  image?: string;
  url?: string;
  siteName?: string;
  type?: 'website' | 'article' | 'product';
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  name: string;
  description: string;
  url: string;
  sameAs?: string[];
  [key: string]: any;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  openGraph?: OpenGraphData;
  structuredData?: StructuredData;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface LandingPageSEO extends SEOConfig {
  openGraph: OpenGraphData;
  structuredData: StructuredData;
}

// Meta tag configuration
export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

// Document head configuration
export interface DocumentHeadConfig {
  title: string;
  metaTags: MetaTag[];
  structuredData?: StructuredData;
  canonical?: string;
}
