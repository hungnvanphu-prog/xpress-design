"use client";

import React from 'react';

interface LogoProps {
  color?: 'white' | 'gold';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ color = 'white', className = '' }) => {
  const titleColor = color === 'white' ? 'text-white' : 'text-[#D4AF37]';
  const subColor = color === 'white' ? 'text-white/60' : 'text-[#D4AF37]/70';

  return (
    <div className={`flex flex-col items-start justify-center leading-none ${className}`}>
      <div
        className={`font-bold tracking-[0.1em] transition-colors duration-300 uppercase ${titleColor}`}
        style={{ fontSize: '20px', fontFamily: 'Montserrat, sans-serif' }}
      >
        Xpress Design
      </div>
      <div
        className={`font-medium tracking-[0.25em] transition-colors duration-300 uppercase ${subColor}`}
        style={{ fontSize: '9px', fontFamily: 'Montserrat, sans-serif', marginTop: '4px' }}
      >
        Architecture &amp; Interior
      </div>
    </div>
  );
};