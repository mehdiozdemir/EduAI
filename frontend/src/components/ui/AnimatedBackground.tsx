import React from 'react';
import FloatingParticles from './FloatingParticles';

interface AnimatedBackgroundProps {
  variant?: 'login' | 'register';
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'login',
  className = '' 
}) => {
  const isLogin = variant === 'login';
  
  return (
    <div className={`fixed inset-0 overflow-hidden ${className}`}>
      {/* Base gradient background */}
      <div className={`absolute inset-0 ${
        isLogin 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' 
          : 'bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50'
      }`} />
      
      {/* Animated gradient overlay */}
      <div className={`absolute inset-0 opacity-60 ${
        isLogin
          ? 'bg-gradient-to-tr from-blue-400/20 via-indigo-400/20 to-purple-400/20'
          : 'bg-gradient-to-tr from-purple-400/20 via-pink-400/20 to-orange-400/20'
      } animate-pulse`} 
      style={{ animationDuration: '4s' }} />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0">
        {/* Large floating circles */}
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 rounded-full ${
          isLogin ? 'bg-blue-200/30' : 'bg-purple-200/30'
        } animate-float`} 
        style={{ animationDelay: '0s', animationDuration: '6s' }} />
        
        <div className={`absolute top-3/4 right-1/4 w-24 h-24 rounded-full ${
          isLogin ? 'bg-indigo-200/30' : 'bg-pink-200/30'
        } animate-float`} 
        style={{ animationDelay: '2s', animationDuration: '8s' }} />
        
        <div className={`absolute top-1/2 right-1/3 w-16 h-16 rounded-full ${
          isLogin ? 'bg-purple-200/30' : 'bg-orange-200/30'
        } animate-float`} 
        style={{ animationDelay: '4s', animationDuration: '7s' }} />

        {/* Geometric shapes */}
        <div className={`absolute top-1/3 right-1/5 w-20 h-20 ${
          isLogin ? 'bg-blue-300/20' : 'bg-purple-300/20'
        } rotate-45 animate-spin-slow`} />
        
        <div className={`absolute bottom-1/4 left-1/5 w-12 h-12 ${
          isLogin ? 'bg-indigo-300/20' : 'bg-pink-300/20'
        } rotate-45 animate-spin-slow`} 
        style={{ animationDelay: '3s' }} />

        {/* Small floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              isLogin 
                ? i % 3 === 0 ? 'bg-blue-300/40' : i % 3 === 1 ? 'bg-indigo-300/40' : 'bg-purple-300/40'
                : i % 3 === 0 ? 'bg-purple-300/40' : i % 3 === 1 ? 'bg-pink-300/40' : 'bg-orange-300/40'
            } animate-float`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Animated lines/paths */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`gradient-${variant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isLogin ? "#3B82F6" : "#8B5CF6"} stopOpacity="0.3" />
            <stop offset="50%" stopColor={isLogin ? "#6366F1" : "#EC4899"} stopOpacity="0.2" />
            <stop offset="100%" stopColor={isLogin ? "#8B5CF6" : "#F97316"} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path
          d="M0,20 Q25,10 50,20 T100,20 L100,0 L0,0 Z"
          fill={`url(#gradient-${variant})`}
          className="animate-wave"
        />
        
        <path
          d="M0,80 Q25,70 50,80 T100,80 L100,100 L0,100 Z"
          fill={`url(#gradient-${variant})`}
          className="animate-wave"
          style={{ animationDelay: '2s' }}
        />
      </svg>

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" 
             style={{
               backgroundImage: `radial-gradient(circle at 1px 1px, ${isLogin ? '#3B82F6' : '#8B5CF6'} 1px, transparent 0)`,
               backgroundSize: '40px 40px'
             }} />
      </div>

      {/* Floating particles */}
      <FloatingParticles variant={variant} count={15} />
    </div>
  );
};

export default AnimatedBackground;