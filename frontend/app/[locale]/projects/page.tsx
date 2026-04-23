"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { ArrowRight } from 'lucide-react';

import { ALL_PROJECTS } from '@/data/projects';

const CATEGORIES = ["Tất cả", "Nhà ở", "Thương mại", "Khác"];

// Helper to map old categories to new simple categories
const mapCategory = (cat: string) => {
  if (['Villa', 'Nhà phố', 'Apartment', 'Penthouse'].includes(cat)) return 'Nhà ở';
  if (['Office', 'Retail', 'Restaurant'].includes(cat)) return 'Thương mại';
  return 'Khác';
};

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <Portfolio />
    </Suspense>
  );
}

function Portfolio() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentCategory = searchParams.get('category') || "Tất cả";

  const filteredProjects = useMemo(() => {
    return ALL_PROJECTS.filter(project => {
      if (currentCategory === "Tất cả") return true;
      return mapCategory(project.category) === currentCategory;
    });
  }, [currentCategory]);

  const handleFilter = (cat: string) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (cat === "Tất cả") {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    const qs = newParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const CUSTOM_EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1.2, ease: CUSTOM_EASE } }
  };

  return (
    <div className="bg-white min-h-screen text-[#1A1A1A] font-['Montserrat',sans-serif]">
      {/* Hero Header Minimalist */}
      <section className="pt-40 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto text-center">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUpVariant}
          className="max-w-4xl mx-auto"
        >
          <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-6 block">
            Dự án tiêu biểu
          </span>
          <h1 className="font-['Playfair_Display',serif] text-[40px] md:text-[72px] leading-[1.1] text-[#1A1A1A] font-medium mb-8">
            Tuyển tập những không gian<br />đậm chất nghệ thuật
          </h1>
          <p className="text-[#4A4A4A] text-[16px] font-light max-w-2xl mx-auto leading-relaxed">
            Mỗi công trình là một câu chuyện độc bản, nơi chúng tôi kết hợp hoàn hảo giữa ngôn ngữ kiến trúc tối giản và công năng sử dụng.
          </p>
        </motion.div>
      </section>

      {/* Elegant Filter */}
      <section className="sticky top-[80px] z-30 bg-white/90 backdrop-blur-md border-b border-gray-100 py-6 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleFilter(cat)}
              className={`relative text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-500 py-2 ${
                currentCategory === cat ? 'text-[#1A1A1A]' : 'text-gray-400 hover:text-[#D4AF37]'
              }`}
            >
              {cat}
              {currentCategory === cat && (
                <motion.div 
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#1A1A1A]"
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-24 px-6 md:px-12 max-w-[1440px] mx-auto">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16"
        >
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2, delay: index * 0.2, ease: CUSTOM_EASE }}
                className="group relative cursor-pointer block w-full overflow-hidden"
              >
                <Link href={`/projects/${project.id}`} className="block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-6">
                    <ImageWithFallback
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
                    />
                    
                    {/* Hover Overlays */}
                    <div className="absolute inset-0 bg-[#D4AF37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    
                    {/* Content Overlay */}
                    <div className="absolute inset-0 p-8 flex flex-col justify-end pointer-events-none">
                      <div className="transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                        <span className="inline-flex items-center gap-2 text-white text-[11px] uppercase tracking-[0.2em] font-bold border border-white/30 px-6 py-3 backdrop-blur-sm hover:bg-white hover:text-black transition-colors">
                          Xem chi tiết <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Project Info below image */}
                  <div className="px-2">
                    <p className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-3">
                      {mapCategory(project.category)}
                    </p>
                    <h3 className="text-[28px] md:text-[32px] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors duration-500 font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {project.title}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        
        {filteredProjects.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-[24px] text-[#1A1A1A] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Không tìm thấy dự án phù hợp
            </p>
            <button 
              onClick={() => handleFilter("Tất cả")}
              className="text-[#D4AF37] text-[11px] uppercase tracking-[0.2em] font-bold border-b border-[#D4AF37] pb-1"
            >
              Xem tất cả dự án
            </button>
          </div>
        )}
      </section>

    </div>
  );
}