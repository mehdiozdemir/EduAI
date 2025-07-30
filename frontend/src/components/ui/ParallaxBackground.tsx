import React, { type ReactNode } from 'react';
import { useParallaxScroll } from '../../hooks/useScrollAnimations';
import { cn } from '../../utils';

interface ParallaxBackgroundProps {
  children: ReactNode;
  speed?: number;
  className?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  overlay?: boolean;
  overlayOpacity?: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  children,
  speed = 0.5,
  className = '',
  backgroundImage,
  backgroundColor = 'bg-gray-100',
  overlay = false,
  overlayOpacity = 0.5
}) => {
  const { ref, style } = useParallaxScroll(speed);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Parallax Background */}
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          'absolute inset-0 w-full h-full -z-10',
          backgroundColor
        )}
        style={{
          ...style,
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '120%', // Extra height for parallax effect
          top: '-10%'
        }}
      >
        {/* Overlay */}
        {overlay && (
          <div 
            className="absolute inset-0 bg-black"
            style={{ opacity: overlayOpacity }}
          />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default ParallaxBackground;
