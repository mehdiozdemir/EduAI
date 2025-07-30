/**
 * Dynamic Content Components
 * React components that dynamically render content from the content management system
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useContentManager } from '../utils/contentManager';
import { useLocalization } from '../utils/localization';
import { ContentAnalytics } from '../utils/contentManager';
import type { FeatureItem, TestimonialItem, StatisticItem } from '../data/content';

// Dynamic Hero Section with A/B testing support
interface DynamicHeroProps {
  variant?: 'default' | 'focused' | 'social-proof';
  showTrustIndicators?: boolean;
  className?: string;
}

export const DynamicHero: React.FC<DynamicHeroProps> = ({ 
  variant = 'default', 
  showTrustIndicators = true,
  className = '' 
}) => {
  const { getContent } = useLocalization();
  const [heroContent, setHeroContent] = useState(getContent()?.hero);

  useEffect(() => {
    ContentAnalytics.trackSectionView('hero');
    try {
      const content = getContent();
      if (content && content.hero) {
        setHeroContent(content.hero);
      }
    } catch (error) {
      console.error('Error loading hero content:', error);
      // Fallback content
      setHeroContent({
        title: "AI ile Kişiselleştirilmiş Eğitim",
        subtitle: "EduAI",
        description: "Yapay zeka destekli öğrenme platformu",
        primaryCTA: {
          text: "Başla",
          href: "/register",
          ariaLabel: "Kayıt ol"
        },
        secondaryCTA: {
          text: "Demo",
          href: "/demo",
          ariaLabel: "Demo izle"
        },
        features: [],
        trustIndicators: {
          userCount: "1000+",
          rating: 4.5,
          testimonialPreview: "Harika platform!"
        }
      });
    }
  }, []); // Remove getContent dependency

  // Handle early render with no content
  if (!heroContent) {
    return (
      <div className={`dynamic-hero ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-100 rounded mb-4"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const handlePrimaryCTA = () => {
    ContentAnalytics.trackCTAClick('hero-primary');
    window.location.href = heroContent.primaryCTA.href;
  };

  const handleSecondaryCTA = () => {
    ContentAnalytics.trackCTAClick('hero-secondary');
    window.location.href = heroContent.secondaryCTA.href;
  };

  const variantStyles = {
    default: 'text-center',
    focused: 'text-left max-w-2xl',
    'social-proof': 'text-center'
  };

  return (
    <div className={`dynamic-hero ${variantStyles[variant]} ${className}`}>
      <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
        {heroContent.title}
      </h1>
      
      <h2 className="text-xl md:text-2xl text-blue-600 font-semibold mb-4">
        {heroContent.subtitle}
      </h2>
      
      <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
        {heroContent.description}
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <button
          onClick={handlePrimaryCTA}
          aria-label={heroContent.primaryCTA.ariaLabel}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
        >
          {heroContent.primaryCTA.text}
        </button>
        
        <button
          onClick={handleSecondaryCTA}
          aria-label={heroContent.secondaryCTA.ariaLabel}
          className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors duration-200"
        >
          {heroContent.secondaryCTA.text}
        </button>
      </div>

      {variant === 'social-proof' && showTrustIndicators && (
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {heroContent.trustIndicators.userCount}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-blue-600">
                  {heroContent.trustIndicators.rating}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-yellow-500 ${
                        i < Math.floor(heroContent.trustIndicators.rating) ? '' : 'opacity-30'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-600">User Rating</div>
            </div>
          </div>
          
          <div className="mt-4 text-center text-gray-700 italic">
            "{heroContent.trustIndicators.testimonialPreview}"
          </div>
        </div>
      )}
    </div>
  );
};

// Dynamic Features Section with filtering
interface DynamicFeaturesProps {
  limit?: number;
  featured?: boolean;
  layout?: 'grid' | 'list' | 'carousel';
  showStats?: boolean;
  className?: string;
}

export const DynamicFeatures: React.FC<DynamicFeaturesProps> = ({
  limit,
  featured,
  layout = 'grid',
  showStats = true,
  className = ''
}) => {
  const { getFeatures } = useContentManager();
  const [features, setFeatures] = useState<FeatureItem[]>([]);

  useEffect(() => {
    ContentAnalytics.trackSectionView('features');
    const filteredFeatures = getFeatures({ 
      limit, 
      featured, 
      sortBy: 'stats' 
    });
    setFeatures(filteredFeatures);
  }, [getFeatures, limit, featured]);

  const handleFeatureClick = (featureId: string) => {
    ContentAnalytics.trackFeatureInteraction(featureId);
  };

  const layoutStyles = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8',
    list: 'space-y-8',
    carousel: 'flex overflow-x-auto gap-8 pb-4'
  };

  return (
    <div className={`dynamic-features ${className}`}>
      <div className={layoutStyles[layout]}>
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => handleFeatureClick(feature.id)}
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">
                  {/* Icon placeholder - replace with actual icon component */}
                  📊
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              {feature.description}
            </p>
            
            <ul className="space-y-2 mb-4">
              {feature.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center text-sm text-gray-700">
                  <span className="text-green-500 mr-2">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
            
            {showStats && feature.stats && (
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {feature.stats.value}
                </div>
                <div className="text-sm text-gray-600">
                  {feature.stats.label}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Dynamic Testimonials with smart rotation
interface DynamicTestimonialsProps {
  limit?: number;
  featured?: boolean;
  autoRotate?: boolean;
  rotationInterval?: number;
  showRating?: boolean;
  className?: string;
}

export const DynamicTestimonials: React.FC<DynamicTestimonialsProps> = ({
  limit = 3,
  featured,
  autoRotate = false,
  rotationInterval = 5000,
  showRating = true,
  className = ''
}) => {
  const { getTestimonials } = useContentManager();
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    ContentAnalytics.trackSectionView('testimonials');
    const filteredTestimonials = getTestimonials({
      limit,
      featured,
      sortBy: 'rating',
      minRating: 4
    });
    setTestimonials(filteredTestimonials);
  }, [getTestimonials, limit, featured]);

  useEffect(() => {
    if (autoRotate && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, rotationInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoRotate, rotationInterval, testimonials.length]);

  const handleTestimonialClick = (testimonialId: string) => {
    ContentAnalytics.trackTestimonialEngagement(testimonialId);
  };

  if (testimonials.length === 0) return null;

  return (
    <div className={`dynamic-testimonials ${className}`}>
      {autoRotate ? (
        // Carousel mode
        <div className="relative">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="w-full flex-shrink-0 px-4"
                  onClick={() => handleTestimonialClick(testimonial.id)}
                >
                  <TestimonialCard 
                    testimonial={testimonial} 
                    showRating={showRating} 
                  />
                </div>
              ))}
            </div>
          </div>
          
          {testimonials.length > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // Grid mode
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              onClick={() => handleTestimonialClick(testimonial.id)}
            >
              <TestimonialCard 
                testimonial={testimonial} 
                showRating={showRating} 
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Testimonial Card Component
interface TestimonialCardProps {
  testimonial: TestimonialItem;
  showRating?: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  showRating = true 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 h-full cursor-pointer hover:shadow-xl transition-shadow duration-200">
      {showRating && (
        <div className="flex items-center mb-4">
          <div className="flex mr-2">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className={`text-yellow-500 ${
                  i < testimonial.rating ? '' : 'opacity-30'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-gray-600">
            {testimonial.rating}/5
          </span>
        </div>
      )}
      
      <p className="text-gray-700 mb-6 italic">
        "{testimonial.content}"
      </p>
      
      <div className="flex items-center">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-12 h-12 rounded-full mr-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-avatar.png';
          }}
        />
        <div>
          <div className="font-semibold text-gray-900">
            {testimonial.name}
          </div>
          <div className="text-sm text-gray-600">
            {testimonial.role}
            {testimonial.company && ` • ${testimonial.company}`}
          </div>
        </div>
      </div>
      
      {testimonial.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {testimonial.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Dynamic Statistics Counter
interface DynamicStatisticsProps {
  animate?: boolean;
  duration?: number;
  className?: string;
}

export const DynamicStatistics: React.FC<DynamicStatisticsProps> = ({
  animate = true,
  duration = 2000,
  className = ''
}) => {
  const { getStatistics } = useContentManager();
  const [statistics, setStatistics] = useState<StatisticItem[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  useEffect(() => {
    ContentAnalytics.trackSectionView('statistics');
    const stats = getStatistics();
    setStatistics(stats);
    
    if (animate) {
      // Initialize animated values to 0
      const initialValues: Record<string, number> = {};
      stats.forEach(stat => {
        initialValues[stat.id] = 0;
      });
      setAnimatedValues(initialValues);
      
      // Animate to final values
      const animationStart = Date.now();
      const animationFrame = () => {
        const elapsed = Date.now() - animationStart;
        const progress = Math.min(elapsed / duration, 1);
        
        const newValues: Record<string, number> = {};
        stats.forEach(stat => {
          newValues[stat.id] = stat.value * progress;
        });
        setAnimatedValues(newValues);
        
        if (progress < 1) {
          requestAnimationFrame(animationFrame);
        }
      };
      
      requestAnimationFrame(animationFrame);
    }
  }, []); // Remove getStatistics, animate, duration dependencies

  const formatValue = (stat: StatisticItem) => {
    const value = animate ? (animatedValues[stat.id] || 0) : stat.value;
    
    switch (stat.format) {
      case 'percentage':
        return `${stat.prefix || ''}${value.toFixed(1)}${stat.suffix || ''}`;
      case 'decimal':
        return `${stat.prefix || ''}${value.toFixed(1)}${stat.suffix || ''}`;
      case 'number':
      default:
        if (value >= 1000000) {
          return `${stat.prefix || ''}${(value / 1000000).toFixed(1)}M${stat.suffix || ''}`;
        } else if (value >= 1000) {
          return `${stat.prefix || ''}${(value / 1000).toFixed(0)}K${stat.suffix || ''}`;
        } else {
          return `${stat.prefix || ''}${Math.floor(value)}${stat.suffix || ''}`;
        }
    }
  };

  return (
    <div className={`dynamic-statistics grid grid-cols-2 lg:grid-cols-4 gap-8 ${className}`}>
      {statistics.map((stat) => (
        <div
          key={stat.id}
          className="text-center p-6 bg-white rounded-lg shadow-lg"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">
              {/* Icon placeholder */}
              📈
            </span>
          </div>
          
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {formatValue(stat)}
          </div>
          
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {stat.label}
          </div>
          
          <div className="text-sm text-gray-600">
            {stat.description}
          </div>
        </div>
      ))}
    </div>
  );
};

// Content Search Component
interface ContentSearchProps {
  placeholder?: string;
  onResults?: (results: any[]) => void;
  sections?: string[];
  className?: string;
}

export const ContentSearch: React.FC<ContentSearchProps> = ({
  placeholder = "Search content...",
  onResults,
  sections = ['features', 'testimonials', 'workflow'],
  className = ''
}) => {
  const { searchContent } = useContentManager();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      onResults?.([]);
      return;
    }
    
    const searchResults = searchContent(searchQuery, sections);
    setResults(searchResults);
    onResults?.(searchResults);
  }, []); // Remove dependencies to prevent infinite loop

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query, handleSearch]);

  return (
    <div className={`content-search ${className}`}>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-gray-400">🔍</span>
        </div>
      </div>
      
      {results.length > 0 && (
        <div className="mt-4 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {result.data.title || result.data.name}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {result.type}
                  </div>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {result.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
