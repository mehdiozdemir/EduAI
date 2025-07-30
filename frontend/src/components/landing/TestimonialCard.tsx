import React from 'react';
import { cn } from '../../utils';

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  avatar: string;
  rating: number;
  quote: string;
  date?: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ 
  testimonial, 
  className 
}) => {
  // Generate star rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={cn(
          'w-4 h-4',
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        )}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl p-6 shadow-lg border border-gray-100',
        'hover:shadow-xl transition-all duration-300',
        'group cursor-pointer h-full flex flex-col',
        className
      )}
    >
      {/* Quote */}
      <div className="flex-1 mb-6">
        <div className="text-gray-400 mb-2">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
          </svg>
        </div>
        <blockquote className="text-gray-700 text-lg leading-relaxed group-hover:text-gray-900 transition-colors duration-300">
          "{testimonial.quote}"
        </blockquote>
      </div>

      {/* Rating */}
      <div className="flex items-center mb-4">
        <div className="flex space-x-1">
          {renderStars(testimonial.rating)}
        </div>
        <span className="ml-2 text-sm text-gray-500">
          {testimonial.rating}/5
        </span>
      </div>

      {/* User Info */}
      <div className="flex items-center">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg shadow-md">
            {testimonial.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
        </div>

        {/* Name and Role */}
        <div className="flex-1 min-w-0">
          <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
            {testimonial.name}
          </h4>
          <p className="text-sm text-gray-600">
            {testimonial.role}
            {testimonial.company && (
              <span className="text-gray-400"> • {testimonial.company}</span>
            )}
          </p>
          {testimonial.date && (
            <p className="text-xs text-gray-400 mt-1">
              {testimonial.date}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
