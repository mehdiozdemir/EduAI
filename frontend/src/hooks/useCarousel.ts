import { useState, useEffect, useCallback, useRef } from 'react';

interface UseCarouselOptions {
  itemsLength: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemsPerView?: number;
}

export const useCarousel = ({
  itemsLength,
  autoPlay = true,
  autoPlayInterval = 5000,
  itemsPerView = 1,
}: UseCarouselOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const maxIndex = Math.max(0, itemsLength - itemsPerView);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && itemsLength > itemsPerView) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, itemsLength, itemsPerView, maxIndex, autoPlayInterval]);

  const goToSlide = useCallback((index: number) => {
    const boundedIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(boundedIndex);
  }, [maxIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const pauseAutoPlay = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resumeAutoPlay = useCallback(() => {
    setIsPlaying(true);
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left - go to next
        goToNext();
      } else {
        // Swipe right - go to previous
        goToPrevious();
      }
    }

    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  }, [touchStart, touchEnd, goToNext, goToPrevious]);

  // Mouse handlers for desktop
  const handleMouseEnter = useCallback(() => {
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const handleMouseLeave = useCallback(() => {
    if (autoPlay) {
      resumeAutoPlay();
    }
  }, [autoPlay, resumeAutoPlay]);

  return {
    currentIndex,
    isPlaying,
    goToSlide,
    goToPrevious,
    goToNext,
    pauseAutoPlay,
    resumeAutoPlay,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    mouseHandlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
  };
};
