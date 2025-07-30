import React from 'react';
import { cn } from '../../utils';
import { useAnimatedCounter } from '../../hooks/useAnimatedCounter';

export interface Statistic {
  id: string;
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
  description?: string;
}

interface StatCardProps {
  stat: Statistic;
  className?: string;
  animationDelay?: number;
  isVisible?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  stat, 
  className,
  animationDelay = 0,
  isVisible = false
}) => {
  const animatedValue = useAnimatedCounter({
    end: stat.value,
    duration: 2000,
    start: 0,
    isVisible,
  });

  return (
    <div
      className={cn(
        'bg-blue-600 rounded-xl p-6 text-center text-white',
        'shadow-lg hover:shadow-xl transition-all duration-300',
        'hover:scale-105 hover:bg-blue-700',
        'transform-gpu cursor-pointer group',
        className
      )}
      style={{
        transitionDelay: `${animationDelay}ms`,
      }}
    >
      {/* Icon */}
      {stat.icon && (
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors duration-300">
            <div className="w-6 h-6 text-white">
              {stat.icon}
            </div>
          </div>
        </div>
      )}

      {/* Animated Counter */}
      <div className="mb-2">
        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold">
          {stat.prefix || ''}
          <span className="tabular-nums">
            {animatedValue.toLocaleString('tr-TR')}
          </span>
          {stat.suffix || ''}
        </span>
      </div>

      {/* Label */}
      <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white/90 group-hover:text-white transition-colors duration-300">
        {stat.label}
      </h3>

      {/* Description */}
      {stat.description && (
        <p className="text-sm text-white/80 group-hover:text-white/90 transition-colors duration-300">
          {stat.description}
        </p>
      )}
    </div>
  );
};

export default StatCard;
