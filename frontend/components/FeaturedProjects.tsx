"use client";

import React from 'react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

import { Link } from '@/i18n/navigation';
import { ALL_PROJECTS } from '../data/projects';

export const FeaturedProjects: React.FC = () => {
  const featured = ALL_PROJECTS.slice(0, 3);

  return (
    <section id="projects" className="bg-[#FFFFFF] py-24 md:py-32 px-6">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 
            className="text-[#1A1A1A] mb-4"
            style={{ fontSize: '40px', fontFamily: 'Playfair Display, serif' }}
          >
            Dự án tiêu biểu
          </h2>
          <div className="w-20 h-1 bg-[#D4AF37] mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {featured.map((project, index) => (
            <motion.div 
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <Link href={`/projects/${project.id}`}>
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden shadow-lg mb-6">
                  <ImageWithFallback
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-[#D4AF37]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-[#1A1A1A] text-[#D4AF37] px-6 py-2 tracking-widest text-sm uppercase font-semibold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      Xem chi tiết
                    </div>
                  </div>
                </div>

                {/* Text Info */}
                <div className="text-left px-2">
                  <h3 
                    className="text-[#1A1A1A] mb-1 transition-colors duration-300 group-hover:text-[#D4AF37]"
                    style={{ fontSize: '20px', fontFamily: 'Playfair Display, serif' }}
                  >
                    {project.title}
                  </h3>
                  <p 
                    className="text-[#D4AF37] tracking-widest uppercase"
                    style={{ fontSize: '14px', fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {project.category}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* View All Button */}
        <div className="flex justify-center mt-20">
          <Link 
            href="/projects"
            className="border-b border-[#D4AF37] text-[#1A1A1A] py-2 px-1 font-medium tracking-widest uppercase text-sm hover:text-[#D4AF37] transition-all duration-300"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Xem tất cả dự án
          </Link>
        </div>
      </div>
    </section>
  );
};