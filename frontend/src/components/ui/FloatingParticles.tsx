import React, { useEffect, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
}

interface FloatingParticlesProps {
  count?: number;
  variant?: 'login' | 'register';
}

const FloatingParticles: React.FC<FloatingParticlesProps> = ({ 
  count = 20,
  variant = 'login' 
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  const colors = variant === 'login' 
    ? ['#3B82F6', '#6366F1', '#8B5CF6', '#60A5FA', '#93C5FD']
    : ['#8B5CF6', '#EC4899', '#F97316', '#A855F7', '#F472B6'];

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 5,
    }));
    
    setParticles(newParticles);
  }, [count, variant]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-30 animate-float"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            boxShadow: `0 0 ${particle.size * 2}px ${particle.color}40`,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingParticles;