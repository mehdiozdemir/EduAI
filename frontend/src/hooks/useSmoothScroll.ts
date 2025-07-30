import { useEffect, useState, useCallback } from 'react';
import { SmoothScrollNavigation, LANDING_PAGE_SECTIONS } from '../utils/smoothScroll';

/**
 * Hook for managing smooth scroll navigation on the landing page
 */
export const useSmoothScrollNavigation = (
  sectionIds: string[] = [...LANDING_PAGE_SECTIONS],
  scrollOffset = 100
) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [navigation, setNavigation] = useState<SmoothScrollNavigation | null>(null);

  // Initialize navigation
  useEffect(() => {
    const nav = new SmoothScrollNavigation(sectionIds, {
      scrollOffset,
      onSectionChange: setActiveSection
    });

    setNavigation(nav);

    // Cleanup on unmount
    return () => {
      nav.destroy();
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Scroll to section function
  const scrollToSection = useCallback((sectionId: string) => {
    navigation?.scrollToSection(sectionId);
  }, [navigation]);

  // Check if a section is active
  const isActive = useCallback((sectionId: string) => {
    return activeSection === sectionId;
  }, [activeSection]);

  return {
    activeSection,
    scrollToSection,
    isActive
  };
};

/**
 * Hook for tracking scroll position
 */
export const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('down');

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollPosition = () => {
      const currentScrollY = window.scrollY;
      // Only update if there's a meaningful change
      if (Math.abs(currentScrollY - lastScrollY) > 1) {
        setScrollY(currentScrollY);
        setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
        lastScrollY = currentScrollY;
      }
    };

    // Throttled scroll handler
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return { scrollY, scrollDirection };
};
