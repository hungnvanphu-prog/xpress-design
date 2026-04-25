"use client";

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ArrowRight, ChevronRight, LayoutGrid } from 'lucide-react';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { Project } from '@/data/projects';

type UiProject = Project & {
  slug: string;
  content?: string;
  featured?: boolean;
  projectType?: string;
  constructionMonths?: number;
  heroSubtitle?: string;
  problemLabel?: string;
  problemTitle?: string;
  problemBody?: string;
  implementationLabel?: string;
  implementationTitle?: string;
  implementationBody?: string;
  resultLabel?: string;
  resultQuote?: string;
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};

interface Props {
  project: UiProject;
  nextProject?: UiProject | null;
}

export default function ProjectDetailClient({ project, nextProject }: Props) {
  const tCommon = useTranslations('Common');
  const tProj = useTranslations('Projects');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);

  const images = (project.gallery && project.gallery.length > 0
    ? project.gallery
    : [project.image]
  ).map((src, i) => ({ src, alt: `${project.title} - ${i + 1}` }));

  const openGallery = (index: number) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  return (
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      {/* 1. Hero */}
      <section className="relative w-full h-[85vh] md:h-screen">
        <ImageWithFallback
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-end pb-16 md:pb-24 px-6 md:px-12 max-w-[1440px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-white text-[48px] md:text-[80px] font-['Playfair_Display',serif] leading-[1.1] font-medium">
              {project.title}
            </h1>
            <p className="text-[#D4AF37] text-[12px] uppercase tracking-[0.25em] font-medium mt-6">
              {project.heroSubtitle || [project.style, project.category].filter(Boolean).join(' · ')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Overview */}
      <section className="bg-white py-16 md:py-24 border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8"
          >
            <motion.div variants={fadeUpVariant} className="hidden md:flex flex-col justify-between">
              <Link href="/projects" className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A4A4A] hover:text-[#D4AF37] transition-colors">
                <ChevronRight className="rotate-180 mr-2" size={14} /> {tCommon('backToList')}
              </Link>
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('client')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">{project.client ?? '—'}</p>
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('location')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">{project.location ?? '—'}</p>
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('type')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">
                {project.projectType
                  ? tProj(`filter.${project.projectType}` as any)
                  : project.category}
              </p>
            </motion.div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-8 pt-12 border-t border-gray-100"
          >
            <motion.div variants={fadeUpVariant} className="hidden md:block" />

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('architect')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">{project.architect ?? '—'}</p>
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('area')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">{project.area ?? '—'}</p>
            </motion.div>

            <motion.div variants={fadeUpVariant}>
              <span className="block text-[#4A4A4A] text-[10px] uppercase tracking-[0.2em] mb-3">{tProj('constructionTime')}</span>
              <p className="font-['Playfair_Display',serif] text-[20px] text-[#1A1A1A]">
                {project.constructionMonths != null
                  ? tProj('months', { count: project.constructionMonths })
                  : '—'}
              </p>
            </motion.div>
          </motion.div>

          {project.year ? (
            <div className="mt-12 flex items-center gap-3 text-[#4A4A4A] text-[12px] uppercase tracking-[0.2em] font-bold">
              <span className="w-8 h-px bg-[#D4AF37]" /> {tProj('year')}: <span className="text-[#1A1A1A]">{project.year}</span>
            </div>
          ) : null}
        </div>
      </section>

      {/* 3. Concept / Description */}
      <section className="py-24 md:py-32 bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="flex flex-col justify-center"
          >
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
              01 — {project.problemLabel || tProj('problem')}
            </span>
            <h2 className="font-['Playfair_Display',serif] text-[36px] md:text-[48px] leading-[1.2] mb-8 text-[#1A1A1A]">
              {project.problemTitle || tProj('problemTitle')}
            </h2>
            <p className="text-[#4A4A4A] text-[15px] leading-[1.8] font-light max-w-md">
              {project.problemBody || project.description}
            </p>

            {project.content ? (
              <div
                className="text-[#4A4A4A] text-[15px] leading-[1.8] font-light mt-8 max-w-md prose prose-sm"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            ) : null}
          </motion.div>

          {images[1] && (
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="relative h-[500px] w-full"
            >
              <ImageWithFallback src={images[1].src} alt={images[1].alt} className="w-full h-full object-cover" />
            </motion.div>
          )}
        </div>
      </section>

      {/* 4. Immersive Image Break */}
      {images[2] && (
        <section className="w-full h-[60vh]">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="w-full h-full"
          >
            <ImageWithFallback
              src={images[2].src}
              alt={images[2].alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </section>
      )}

      {/* 5. Development / Result */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-20">
          {images[3] && (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUpVariant}
              className="order-2 md:order-1 relative h-[500px] w-full"
            >
              <ImageWithFallback
                src={images[3].src}
                alt={images[3].alt}
                className="w-full h-full object-cover"
              />
            </motion.div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUpVariant}
            className="order-1 md:order-2 flex flex-col justify-center"
          >
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
              02 — {project.implementationLabel || tProj('implementation')}
            </span>
            <h2 className="font-['Playfair_Display',serif] text-[36px] md:text-[48px] leading-[1.2] mb-8 text-[#1A1A1A]">
              {project.implementationTitle || tProj('implementationTitle')}
            </h2>
            <p className="text-[#4A4A4A] text-[15px] leading-[1.8] font-light max-w-md mb-12">
              {project.implementationBody || tProj('implementationDescription')}
            </p>
            <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-4">
              03 — {project.resultLabel || tProj('result')}
            </span>
            <p className="text-[#1A1A1A] font-['Playfair_Display',serif] text-[24px] italic max-w-md border-l-[3px] border-[#D4AF37] pl-6">
              “{project.resultQuote || tProj('resultQuote')}”
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery */}
      {images.length > 0 && (
        <section className="py-24 bg-[#1A1A1A] text-white">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUpVariant}
              className="flex items-end justify-between mb-16"
            >
              <h2 className="font-['Playfair_Display',serif] text-[40px] text-white">{tProj('gallery')}</h2>
              <button
                onClick={() => openGallery(0)}
                className="hidden md:flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 hover:text-white transition-colors"
              >
                <LayoutGrid size={14} className="mr-2" /> {tProj('fullscreen')}
              </button>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
              {images.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`group relative overflow-hidden cursor-pointer ${
                    idx === 0 ? 'md:col-span-8 h-[600px]' :
                    idx === 1 ? 'md:col-span-4 h-[600px]' :
                    idx % 2 === 0 ? 'md:col-span-6 h-[450px]' :
                    'md:col-span-6 h-[450px]'
                  }`}
                  onClick={() => openGallery(idx)}
                >
                  <ImageWithFallback
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 text-white uppercase text-[10px] tracking-[0.2em] font-bold border border-white/50 px-6 py-3 backdrop-blur-sm">
                      {tProj('zoom')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA / Next Project */}
      {nextProject && (
        <section className="relative h-[70vh] w-full group overflow-hidden cursor-pointer">
          <ImageWithFallback
            src={nextProject.image}
            alt={nextProject.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-colors duration-700" />

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.2em] font-bold mb-4 block">
                {tCommon('nextProject')}
              </span>
              <h2 className="text-white text-[40px] md:text-[64px] font-['Playfair_Display',serif] leading-tight mb-8">
                {nextProject.title}
              </h2>
              <Link
                href={`/projects/${nextProject.slug}`}
                className="inline-flex items-center text-white text-[11px] uppercase tracking-[0.2em] font-bold hover:text-[#D4AF37] transition-colors"
              >
                {tCommon('discover')} <ArrowRight size={16} className="ml-3" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={photoIndex}
        slides={images}
        styles={{ container: { backgroundColor: "rgba(0, 0, 0, 0.95)" } }}
      />
    </div>
  );
}
