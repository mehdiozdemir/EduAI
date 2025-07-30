import { useEffect, useState } from 'react';

// Breakpoint definitions following Tailwind CSS conventions
export const breakpoints = {
  sm: 640,   // Small devices (phones)
  md: 768,   // Medium devices (tablets)
  lg: 1024,  // Large devices (laptops)
  xl: 1280,  // Extra large devices (desktops)
  '2xl': 1536 // 2X Large devices (large desktops)
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to detect current screen size and breakpoint
 */
export const useBreakpoint = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });

      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    };

    // Initial check
    updateBreakpoint();

    // Add event listener
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  const isMobile = currentBreakpoint === 'sm';
  const isTablet = currentBreakpoint === 'md';
  const isDesktop = currentBreakpoint === 'lg' || currentBreakpoint === 'xl' || currentBreakpoint === '2xl';

  return {
    currentBreakpoint,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    // Utility functions
    isBreakpoint: (bp: Breakpoint) => currentBreakpoint === bp,
    isBreakpointUp: (bp: Breakpoint) => screenSize.width >= breakpoints[bp],
    isBreakpointDown: (bp: Breakpoint) => screenSize.width < breakpoints[bp]
  };
};

/**
 * Hook for responsive values based on breakpoints
 */
export const useResponsiveValue = <T>(values: {
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}) => {
  const { currentBreakpoint } = useBreakpoint();

  // Find the appropriate value for current breakpoint
  const getValue = (): T | undefined => {
    const breakpointOrder: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

    // Look for value at current breakpoint or fallback to smaller ones
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return undefined;
  };

  return getValue();
};

/**
 * Hook for touch-friendly interactions
 */
export const useTouchFriendly = () => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    const checkTouchSupport = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    checkTouchSupport();
    window.addEventListener('touchstart', checkTouchSupport, { once: true });

    return () => {
      window.removeEventListener('touchstart', checkTouchSupport);
    };
  }, []);

  // Touch-friendly configurations
  const touchConfig = {
    minTouchTarget: isTouchDevice ? '44px' : '40px', // iOS HIG minimum
    tapHighlight: isTouchDevice ? 'transparent' : 'initial',
    userSelect: isTouchDevice ? 'none' : 'initial',
    touchAction: isTouchDevice ? 'manipulation' : 'initial'
  };

  const getTouchFriendlyProps = () => ({
    style: {
      minHeight: touchConfig.minTouchTarget,
      minWidth: touchConfig.minTouchTarget,
      WebkitTapHighlightColor: touchConfig.tapHighlight,
      userSelect: touchConfig.userSelect,
      touchAction: touchConfig.touchAction
    } as React.CSSProperties
  });

  return {
    isTouchDevice,
    isMobile,
    touchConfig,
    getTouchFriendlyProps
  };
};

/**
 * Hook for viewport-based font scaling
 */
export const useResponsiveFontSize = () => {
  const { currentBreakpoint } = useBreakpoint();

  const fontScales = {
    sm: {
      h1: 'text-3xl', // 30px
      h2: 'text-2xl', // 24px
      h3: 'text-xl',  // 20px
      h4: 'text-lg',  // 18px
      body: 'text-base', // 16px
      small: 'text-sm'   // 14px
    },
    md: {
      h1: 'text-4xl', // 36px
      h2: 'text-3xl', // 30px
      h3: 'text-2xl', // 24px
      h4: 'text-xl',  // 20px
      body: 'text-base', // 16px
      small: 'text-sm'   // 14px
    },
    lg: {
      h1: 'text-5xl', // 48px
      h2: 'text-4xl', // 36px
      h3: 'text-3xl', // 30px
      h4: 'text-2xl', // 24px
      body: 'text-lg',   // 18px
      small: 'text-base' // 16px
    },
    xl: {
      h1: 'text-6xl', // 60px
      h2: 'text-5xl', // 48px
      h3: 'text-4xl', // 36px
      h4: 'text-3xl', // 30px
      body: 'text-lg',   // 18px
      small: 'text-base' // 16px
    },
    '2xl': {
      h1: 'text-7xl', // 72px
      h2: 'text-6xl', // 60px
      h3: 'text-5xl', // 48px
      h4: 'text-4xl', // 36px
      body: 'text-xl',   // 20px
      small: 'text-lg'   // 18px
    }
  };

  return fontScales[currentBreakpoint];
};

/**
 * Hook for responsive spacing
 */
export const useResponsiveSpacing = () => {
  const { currentBreakpoint } = useBreakpoint();

  const spacingScales = {
    sm: {
      section: 'py-12 px-4',
      container: 'px-4',
      gap: 'gap-4',
      margin: 'mb-6'
    },
    md: {
      section: 'py-16 px-6',
      container: 'px-6',
      gap: 'gap-6',
      margin: 'mb-8'
    },
    lg: {
      section: 'py-20 px-8',
      container: 'px-8',
      gap: 'gap-8',
      margin: 'mb-12'
    },
    xl: {
      section: 'py-24 px-8',
      container: 'px-8',
      gap: 'gap-8',
      margin: 'mb-16'
    },
    '2xl': {
      section: 'py-32 px-8',
      container: 'px-8',
      gap: 'gap-12',
      margin: 'mb-20'
    }
  };

  return spacingScales[currentBreakpoint];
};

/**
 * Hook for device orientation detection
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape');
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape'
  };
};

/**
 * Hook for safe area insets (for mobile notches, status bars, etc.)
 */
export const useSafeArea = () => {
  const [safeAreaInsets, setSafeAreaInsets] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  });

  useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      
      setSafeAreaInsets({
        top: parseInt(computedStyle.getPropertyValue('--safe-area-inset-top') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-area-inset-right') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-area-inset-left') || '0')
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);

    return () => window.removeEventListener('resize', updateSafeArea);
  }, []);

  const getSafeAreaStyle = () => ({
    paddingTop: `max(env(safe-area-inset-top), ${safeAreaInsets.top}px)`,
    paddingRight: `max(env(safe-area-inset-right), ${safeAreaInsets.right}px)`,
    paddingBottom: `max(env(safe-area-inset-bottom), ${safeAreaInsets.bottom}px)`,
    paddingLeft: `max(env(safe-area-inset-left), ${safeAreaInsets.left}px)`
  });

  return {
    safeAreaInsets,
    getSafeAreaStyle
  };
};

export default {
  useBreakpoint,
  useResponsiveValue,
  useTouchFriendly,
  useResponsiveFontSize,
  useResponsiveSpacing,
  useOrientation,
  useSafeArea,
  breakpoints
};
