import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  placeholder?: string;
  blurDataURL?: string;
  priority?: boolean;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Im0xNSAxNSA2IDUgNi0xMC0xMSAxMFoiIGZpbGw9IiNDQ0NERDAiLz4KPC9zdmc+',
  blurDataURL,
  priority = false,
  sizes = '100vw',
  loading = 'lazy',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    observer.observe(img);

    return () => observer.disconnect();
  }, [priority, loading]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Generate responsive srcSet for better performance
  const generateSrcSet = (baseSrc: string) => {
    if (!baseSrc.includes('.')) return baseSrc;
    
    const [name, ext] = baseSrc.split('.');
    return [
      `${name}-400w.${ext} 400w`,
      `${name}-800w.${ext} 800w`,
      `${name}-1200w.${ext} 1200w`,
      `${name}-1600w.${ext} 1600w`
    ].join(', ');
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : `url(${placeholder})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)'
          }}
        >
          <div className="w-8 h-8 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="w-12 h-12 mx-auto mb-2 text-gray-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/>
              </svg>
            </div>
            <p className="text-sm">Resim yüklenemedi</p>
          </div>
        </div>
      )}

      {/* Main Image */}
      {isInView && (
        <img
          ref={imgRef}
          src={src}
          srcSet={generateSrcSet(src)}
          sizes={sizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0',
            hasError && 'hidden'
          )}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
