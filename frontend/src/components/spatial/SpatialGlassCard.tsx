import React, { useState } from 'react';

interface SpatialGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const SpatialGlassCard: React.FC<SpatialGlassCardProps> = ({ children, className = '', glow = false, onClick }) => {
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (-y / (rect.height / 2)) * 1.2;
    const rotateY = (x / (rect.width / 2)) * 1.2;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  };

  return (
    <div
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' }}
      className={`modern-card modern-card-interactive relative rounded-2xl overflow-hidden ${
        glow
          ? 'border-[#c9a45c]/40 shadow-[0_15px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(107,29,47,0.25)]'
          : 'border-[#28211a] shadow-[0_10px_25px_rgba(0,0,0,0.85)]'
      } ${className}`}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
