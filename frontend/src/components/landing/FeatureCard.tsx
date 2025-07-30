import React from 'react';
import Card, { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { cn } from '../../utils';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

interface FeatureCardProps {
  feature: Feature;
  className?: string;
  animationDelay?: number;
}

const colorStyles = {
  blue: {
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    border: 'hover:border-blue-200',
  },
  green: {
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    border: 'hover:border-green-200',
  },
  purple: {
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    border: 'hover:border-purple-200',
  },
  orange: {
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    border: 'hover:border-orange-200',
  },
};

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  feature, 
  className,
  animationDelay = 0 
}) => {
  const colorStyle = colorStyles[feature.color || 'blue'];

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300',
        'hover:shadow-xl hover:-translate-y-2 hover:scale-105',
        'hover:bg-white/90 backdrop-blur-sm',
        colorStyle.border,
        'transform-gpu', // Enable hardware acceleration
        className
      )}
      style={{
        animationDelay: `${animationDelay}ms`,
      }}
    >
      <CardContent className="p-6">
        {/* Icon Container */}
        <div className={cn(
          'inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4',
          'transition-all duration-300 group-hover:scale-110',
          colorStyle.iconBg,
          'group-hover:shadow-lg'
        )}>
          <div className={cn(
            'w-6 h-6 transition-all duration-300',
            colorStyle.iconColor,
            'group-hover:scale-110'
          )}>
            {feature.icon}
          </div>
        </div>

        {/* Card Header */}
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-300">
            {feature.title}
          </CardTitle>
        </CardHeader>

        {/* Card Description */}
        <CardDescription className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
          {feature.description}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
