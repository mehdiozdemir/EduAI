/**
 * Smooth scroll navigation utilities for the landing page
 * Provides smooth scrolling to sections and active section tracking
 */

export interface ScrollOptions {
  behavior?: 'smooth' | 'auto';
  block?: 'start' | 'center' | 'end' | 'nearest';
  inline?: 'start' | 'center' | 'end' | 'nearest';
  offset?: number; // Additional offset from top (useful for fixed headers)
}

/**
 * Smoothly scroll to an element by its ID
 */
export const scrollToSection = (sectionId: string, options: ScrollOptions = {}) => {
  const element = document.getElementById(sectionId);
  
  if (!element) {
    console.warn(`Element with ID "${sectionId}" not found`);
    return;
  }

  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    offset = 0
  } = options;

  // If there's an offset, we need to use scrollTo instead of scrollIntoView
  if (offset !== 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior
    });
  } else {
    element.scrollIntoView({
      behavior,
      block,
      inline
    });
  }
};

/**
 * Get the currently active section based on scroll position
 */
export const getActiveSection = (sectionIds: string[], offset = 100): string | null => {
  const scrollPosition = window.scrollY + offset;

  // Find the section that's currently in view
  for (let i = sectionIds.length - 1; i >= 0; i--) {
    const sectionId = sectionIds[i];
    const element = document.getElementById(sectionId);
    
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      
      if (scrollPosition >= elementTop) {
        return sectionId;
      }
    }
  }

  return sectionIds[0] || null;
};

/**
 * Throttle function to limit how often a function can be called
 */
export const throttle = <T extends (...args: any[]) => void>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Debounce function to delay function execution
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Check if an element is in the viewport
 */
export const isInViewport = (element: Element, offset = 0): boolean => {
  const rect = element.getBoundingClientRect();
  const windowHeight = window.innerHeight || document.documentElement.clientHeight;
  
  return (
    rect.top >= -offset &&
    rect.bottom <= windowHeight + offset
  );
};

/**
 * Navigation handler class for managing smooth scroll navigation
 */
export class SmoothScrollNavigation {
  private sectionIds: string[];
  private currentSection: string | null = null;
  private scrollOffset: number;
  private onSectionChange?: (sectionId: string | null) => void;
  private scrollHandler: () => void;

  constructor(
    sectionIds: string[],
    options: {
      scrollOffset?: number;
      onSectionChange?: (sectionId: string | null) => void;
    } = {}
  ) {
    this.sectionIds = sectionIds;
    this.scrollOffset = options.scrollOffset || 100;
    this.onSectionChange = options.onSectionChange;
    
    // Create throttled scroll handler
    this.scrollHandler = throttle(() => {
      this.updateActiveSection();
    }, 100);

    this.init();
  }

  private init() {
    // Set initial active section
    this.updateActiveSection();
    
    // Listen for scroll events
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  private updateActiveSection() {
    const newActiveSection = getActiveSection(this.sectionIds, this.scrollOffset);
    
    if (newActiveSection !== this.currentSection) {
      this.currentSection = newActiveSection;
      this.onSectionChange?.(newActiveSection);
    }
  }

  public scrollToSection(sectionId: string) {
    scrollToSection(sectionId, {
      behavior: 'smooth',
      block: 'start',
      offset: this.scrollOffset
    });
  }

  public getCurrentSection(): string | null {
    return this.currentSection;
  }

  public destroy() {
    window.removeEventListener('scroll', this.scrollHandler);
  }
}

/**
 * Default section IDs for the landing page
 */
export const LANDING_PAGE_SECTIONS = [
  'hero',
  'features',
  'how-it-works',
  'statistics',
  'testimonials',
  'cta'
] as const;

export type LandingPageSection = typeof LANDING_PAGE_SECTIONS[number];
