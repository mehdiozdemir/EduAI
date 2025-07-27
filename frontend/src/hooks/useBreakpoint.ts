import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const breakpoints: BreakpointConfig = {
  xs: 475,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export const useBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');
  const [windowWidth, setWindowWidth] = useState<number>(0);

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= breakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    // Set initial breakpoint
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const isBreakpoint = (breakpoint: Breakpoint): boolean => {
    return windowWidth >= breakpoints[breakpoint];
  };

  const isMobile = currentBreakpoint === 'xs' || currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  return {
    currentBreakpoint,
    windowWidth,
    isBreakpoint,
    isMobile,
    isTablet,
    isDesktop,
    breakpoints,
  };
};

export default useBreakpoint;