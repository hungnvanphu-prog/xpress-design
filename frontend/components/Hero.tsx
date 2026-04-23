"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1772411650649-f88111bcb8a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBtb2Rlcm4lMjB2aWxsYSUyMGFyY2hpdGVjdHVyZSUyMGV4dGVyaW9yJTIwYXJjaGl0ZWN0dXJlJTIwYW5kJTIwaW50ZXJpb3IlMjBsdXh1cnklMjBtaW5pbWFsfGVufDF8fHx8MTc3NTc0NTQ4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Luxury Architecture Hero"
          className="w-full h-full object-cover scale-105"
        />
        {/* Parallax Overlay (Simplified) */}
        <div className="absolute inset-0 bg-black/40 bg-linear-to-b from-black/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center text-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex flex-col items-center max-w-4xl"
        >
          <h1 
            className="text-white uppercase tracking-[0.2em] font-medium mb-6"
            style={{ fontSize: '64px', fontFamily: 'Playfair Display, serif' }}
          >
            XPRESS DESIGN
          </h1>
          <p 
            className="text-white/80 font-light mb-10"
            style={{ fontSize: '20px', fontFamily: 'Montserrat, sans-serif' }}
          >
            Kiến trúc & Nội thất — Nghệ thuật của không gian sống
          </p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-8 py-3 overflow-hidden border border-[#D4AF37] text-[#D4AF37] font-medium tracking-widest uppercase text-sm transition-all duration-300"
            style={{ borderRadius: '0px' }}
          >
            <div className="absolute inset-0 bg-[#D4AF37] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 group-hover:text-black transition-colors duration-300">
              Khám phá dự án
            </span>
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
        <div className="w-px h-12 bg-white/30 relative overflow-hidden">
          <motion.div 
            animate={{ y: [0, 48, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 left-0 w-full h-1/2 bg-[#D4AF37]"
          />
        </div>
      </div>
    </section>
  );
};