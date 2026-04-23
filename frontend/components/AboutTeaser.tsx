"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export const AboutTeaser: React.FC = () => {
  return (
    <section id="intro" className="bg-[#F8F9FA] py-24 md:py-32 px-6 overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          
          {/* Text Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 flex flex-col items-start"
          >
            <h2 
              className="text-[#1A1A1A] mb-8 relative"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              Về chúng tôi
              <div className="absolute -bottom-4 left-0 w-16 h-1 bg-[#D4AF37]" />
            </h2>
            
            <p 
              className="text-[#4A4A4A] leading-relaxed mb-8 text-lg"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Tại Xpress Design, chúng tôi không chỉ thiết kế những công trình, mà chúng tôi kiến tạo những giá trị sống đích thực. Mỗi bản thiết kế là sự hòa quyện hoàn hảo giữa tính công năng hiện đại và vẻ đẹp nghệ thuật tinh tế.
            </p>
            
            <p 
              className="text-[#4A4A4A] leading-relaxed mb-10 text-lg"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Triết lý Luxury Minimalism (Tối giản Sang trọng) dẫn dắt chúng tôi loại bỏ những chi tiết rườm rà, tập trung vào bản chất của vật liệu và không gian để tạo ra một môi trường sống cân bằng, sang trọng và trường tồn với thời gian.
            </p>
            
            <button className="flex items-center space-x-2 text-[#D4AF37] font-semibold tracking-widest uppercase text-sm hover:translate-x-2 transition-transform duration-300">
              <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Tìm hiểu thêm</span>
              <ArrowRight size={20} />
            </button>
          </motion.div>
          
          {/* Image Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="w-full lg:w-1/2 relative group"
          >
            <div className="relative z-10 overflow-hidden shadow-2xl">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1643267514395-b36b3f7e8281?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBpbnRlcmlvciUyMGFyY2hpdGVjdHVyZSUyMHdvcmtzcGFjZSUyMG9mZmljZSUyMGFyY2hpdGVjdHVyZSUyMGRlc2lnbmVyJTIwbWluaW1hbHxlbnwxfHx8fDE3NzU3NDU1NTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Architecture Design Process"
                className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
            
            {/* Decoration Element */}
            <div className="absolute -top-6 -right-6 w-32 h-32 border border-[#D4AF37]/30 z-0 pointer-events-none hidden md:block" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#D4AF37]/10 z-0 pointer-events-none hidden md:block" />
          </motion.div>
          
        </div>
      </div>
    </section>
  );
};