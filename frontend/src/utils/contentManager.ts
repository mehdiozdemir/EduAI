/**
 * Content Management Utilities
 * Dynamic content handling, localization, and content optimization
 */

import { landingPageContent } from '../data/content';
import type { 
  FeatureItem, 
  StatisticItem, 
  TestimonialItem
} from '../data/content';

// Language support interface
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl?: boolean;
}

// Supported languages
export const supportedLanguages: Language[] = [
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', rtl: true },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'fr', name: 'French', nativeName: 'Français' }
];

// Content filtering and sorting utilities
class ContentManagerClass {
  private static instance: ContentManagerClass;
  private currentLanguage: string = 'tr';
  private contentCache: Map<string, any> = new Map();

  static getInstance(): ContentManagerClass {
    if (!ContentManagerClass.instance) {
      ContentManagerClass.instance = new ContentManagerClass();
    }
    return ContentManagerClass.instance;
  }

  // Language management
  setLanguage(languageCode: string): void {
    if (supportedLanguages.find(lang => lang.code === languageCode)) {
      this.currentLanguage = languageCode;
      this.clearCache();
    }
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  isRTL(): boolean {
    const language = supportedLanguages.find(lang => lang.code === this.currentLanguage);
    return language?.rtl || false;
  }

  // Cache management
  private clearCache(): void {
    this.contentCache.clear();
  }

  private getCacheKey(type: string, filters?: any): string {
    return `${this.currentLanguage}-${type}-${JSON.stringify(filters || {})}`;
  }

  // Feature filtering and sorting
  getFeatures(options?: {
    limit?: number;
    featured?: boolean;
    category?: string;
    sortBy?: 'title' | 'stats' | 'benefits';
  }): FeatureItem[] {
    const cacheKey = this.getCacheKey('features', options);
    
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    let features = [...(landingPageContent?.features || [])];

    // Apply filters
    if (options?.featured) {
      features = features.filter(feature => feature.stats);
    }

    // Apply sorting
    if (options?.sortBy) {
      features.sort((a, b) => {
        switch (options.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'stats':
            const aValue = parseInt(a.stats?.value || '0');
            const bValue = parseInt(b.stats?.value || '0');
            return bValue - aValue;
          case 'benefits':
            return b.benefits.length - a.benefits.length;
          default:
            return 0;
        }
      });
    }

    // Apply limit
    if (options?.limit) {
      features = features.slice(0, options.limit);
    }

    this.contentCache.set(cacheKey, features);
    return features;
  }

  // Testimonial filtering and sorting
  getTestimonials(options?: {
    limit?: number;
    featured?: boolean;
    minRating?: number;
    tags?: string[];
    sortBy?: 'date' | 'rating' | 'name';
    randomize?: boolean;
  }): TestimonialItem[] {
    const cacheKey = this.getCacheKey('testimonials', options);
    
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    let testimonials = [...(landingPageContent?.testimonials || [])];

    // Apply filters
    if (options?.featured !== undefined) {
      testimonials = testimonials.filter(t => t.featured === options.featured);
    }

    if (options?.minRating !== undefined) {
      testimonials = testimonials.filter(t => t.rating >= options.minRating!);
    }

    if (options?.tags && options.tags.length > 0) {
      testimonials = testimonials.filter(t => 
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }

    // Apply sorting
    if (options?.sortBy && !options.randomize) {
      testimonials.sort((a, b) => {
        switch (options.sortBy) {
          case 'date':
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'rating':
            return b.rating - a.rating;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
    }

    // Randomize if requested
    if (options?.randomize) {
      for (let i = testimonials.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [testimonials[i], testimonials[j]] = [testimonials[j], testimonials[i]];
      }
    }

    // Apply limit
    if (options?.limit) {
      testimonials = testimonials.slice(0, options.limit);
    }

    this.contentCache.set(cacheKey, testimonials);
    return testimonials;
  }

  // Statistics formatting
  getFormattedStatistics(): StatisticItem[] {
    const cacheKey = this.getCacheKey('statistics');
    
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    const statistics = (landingPageContent?.statistics || []).map((stat: StatisticItem) => ({
      ...stat,
      formattedValue: this.formatStatisticValue(stat)
    }));

    this.contentCache.set(cacheKey, statistics);
    return statistics;
  }

  private formatStatisticValue(stat: StatisticItem): string {
    let value = stat.value;
    let formattedValue: string;

    switch (stat.format) {
      case 'percentage':
        formattedValue = value.toFixed(1);
        break;
      case 'decimal':
        formattedValue = value.toFixed(1);
        break;
      case 'number':
      default:
        if (value >= 1000000) {
          formattedValue = (value / 1000000).toFixed(1) + 'M';
        } else if (value >= 1000) {
          formattedValue = (value / 1000).toFixed(0) + 'K';
        } else {
          formattedValue = value.toString();
        }
        break;
    }

    return `${stat.prefix || ''}${formattedValue}${stat.suffix || ''}`;
  }

  // Content search
  searchContent(query: string, sections?: string[]): any[] {
    const searchQuery = query.toLowerCase();
    const results: any[] = [];

    const searchSections = sections || ['features', 'testimonials', 'workflow'];

    if (searchSections.includes('features')) {
      const features = (landingPageContent?.features || []).filter((feature: FeatureItem) =>
        feature.title.toLowerCase().includes(searchQuery) ||
        feature.description.toLowerCase().includes(searchQuery) ||
        feature.benefits.some((benefit: string) => benefit.toLowerCase().includes(searchQuery))
      );
      results.push(...features.map((f: FeatureItem) => ({ type: 'feature', data: f })));
    }

    if (searchSections.includes('testimonials')) {
      const testimonials = (landingPageContent?.testimonials || []).filter((testimonial: TestimonialItem) =>
        testimonial.name.toLowerCase().includes(searchQuery) ||
        testimonial.content.toLowerCase().includes(searchQuery) ||
        testimonial.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery))
      );
      results.push(...testimonials.map((t: TestimonialItem) => ({ type: 'testimonial', data: t })));
    }

    if (searchSections.includes('workflow')) {
      const workflow = (landingPageContent?.workflow || []).filter((step: any) =>
        step.title.toLowerCase().includes(searchQuery) ||
        step.description.toLowerCase().includes(searchQuery) ||
        step.details.some((detail: string) => detail.toLowerCase().includes(searchQuery))
      );
      results.push(...workflow.map((w: any) => ({ type: 'workflow', data: w })));
    }

    return results;
  }

  // Dynamic content updates
  updateContent(section: string, updates: Partial<any>): boolean {
    try {
      if (!landingPageContent) return false;
      
      switch (section) {
        case 'hero':
          if (landingPageContent.hero) {
            Object.assign(landingPageContent.hero, updates);
          }
          break;
        case 'cta':
          if (landingPageContent.cta) {
            Object.assign(landingPageContent.cta, updates);
          }
          break;
        default:
          return false;
      }
      this.clearCache();
      return true;
    } catch (error) {
      console.error('Content update failed:', error);
      return false;
    }
  }

  // Content validation
  validateContent(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!landingPageContent) {
      errors.push('Landing page content is not available');
      return { isValid: false, errors };
    }

    // Validate hero content
    if (!landingPageContent.hero?.title || landingPageContent.hero.title.length < 10) {
      errors.push('Hero title is too short or missing');
    }

    if (!landingPageContent.hero?.primaryCTA?.href) {
      errors.push('Hero primary CTA href is missing');
    }

    // Validate features
    if (!landingPageContent.features || landingPageContent.features.length < 3) {
      errors.push('At least 3 features are required');
    }

    (landingPageContent.features || []).forEach((feature: FeatureItem, index: number) => {
      if (!feature.title || feature.title.length < 5) {
        errors.push(`Feature ${index + 1} title is too short or missing`);
      }
      if (!feature.benefits || feature.benefits.length === 0) {
        errors.push(`Feature ${index + 1} has no benefits listed`);
      }
    });

    // Validate testimonials
    if (!landingPageContent.testimonials || landingPageContent.testimonials.length < 3) {
      errors.push('At least 3 testimonials are required');
    }

    (landingPageContent.testimonials || []).forEach((testimonial: TestimonialItem, index: number) => {
      if (testimonial.rating < 3) {
        errors.push(`Testimonial ${index + 1} has low rating (${testimonial.rating})`);
      }
      if (!testimonial.content || testimonial.content.length < 20) {
        errors.push(`Testimonial ${index + 1} content is too short`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Content hooks for React components
export const useContentManager = () => {
  const contentManager = ContentManagerClass.getInstance();
  
  return {
    getFeatures: (options?: any) => contentManager.getFeatures(options),
    getTestimonials: (options?: any) => contentManager.getTestimonials(options),
    getStatistics: () => contentManager.getFormattedStatistics(),
    searchContent: (query: string, sections?: string[]) => 
      contentManager.searchContent(query, sections),
    setLanguage: (lang: string) => contentManager.setLanguage(lang),
    getCurrentLanguage: () => contentManager.getCurrentLanguage(),
    isRTL: () => contentManager.isRTL(),
    validateContent: () => contentManager.validateContent()
  };
};

// Content analytics
export interface ContentAnalytics {
  sectionViews: Record<string, number>;
  ctaClicks: Record<string, number>;
  testimonialEngagement: Record<string, number>;
  featureInteractions: Record<string, number>;
}

export class ContentAnalytics {
  private static analytics: ContentAnalytics = {
    sectionViews: {},
    ctaClicks: {},
    testimonialEngagement: {},
    featureInteractions: {}
  };

  static trackSectionView(sectionId: string): void {
    this.analytics.sectionViews[sectionId] = 
      (this.analytics.sectionViews[sectionId] || 0) + 1;
  }

  static trackCTAClick(ctaId: string): void {
    this.analytics.ctaClicks[ctaId] = 
      (this.analytics.ctaClicks[ctaId] || 0) + 1;
  }

  static trackTestimonialEngagement(testimonialId: string): void {
    this.analytics.testimonialEngagement[testimonialId] = 
      (this.analytics.testimonialEngagement[testimonialId] || 0) + 1;
  }

  static trackFeatureInteraction(featureId: string): void {
    this.analytics.featureInteractions[featureId] = 
      (this.analytics.featureInteractions[featureId] || 0) + 1;
  }

  static getAnalytics(): ContentAnalytics {
    return { ...this.analytics };
  }

  static getMostEngagingContent(): {
    topSections: string[];
    topCTAs: string[];
    topTestimonials: string[];
    topFeatures: string[];
  } {
    const sortByValue = (obj: Record<string, number>) => 
      Object.entries(obj)
        .sort(([, a], [, b]) => b - a)
        .map(([key]) => key);

    return {
      topSections: sortByValue(this.analytics.sectionViews).slice(0, 3),
      topCTAs: sortByValue(this.analytics.ctaClicks).slice(0, 3),
      topTestimonials: sortByValue(this.analytics.testimonialEngagement).slice(0, 3),
      topFeatures: sortByValue(this.analytics.featureInteractions).slice(0, 3)
    };
  }
}

// Export utilities
export const ContentManager = ContentManagerClass;
export default ContentManagerClass;
