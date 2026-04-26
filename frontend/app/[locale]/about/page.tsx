"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate, useMotionValue, useTransform } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { PageHero } from '@/components/PageHero';
import { 
  Target, 
  Lightbulb, 
  Compass, 
  Award, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  MessageSquare
} from 'lucide-react';

const Counter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return controls.stop;
    }
  }, [isInView, value, count]);

  useEffect(() => {
    return rounded.on("change", (latest) => setDisplayValue(latest));
  }, [rounded]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

export default function About() {
  const tNav = useTranslations('Nav');
  const tPage = useTranslations('PageTitles');
  const tTag = useTranslations('HeroTaglines');
  const tAbout = useTranslations('About');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white">
      <PageHero
        image="https://images.unsplash.com/photo-1770943558988-2c605d6bd5a7"
        title={tPage('about')}
        breadcrumb={tNav('about')}
        homeLabel={tNav('home')}
        tagline={tTag('about')}
        alt={tAbout('heroImageAlt')}
      />

      {/* Our Story Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 
                className="text-[#1A1A1A] mb-8"
                style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
              >
                {tAbout('storyTitle')}
              </h2>
              <div className="space-y-6 text-gray-600 leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <p>{tAbout('storyP1')}</p>
                <p>{tAbout('storyP2')}</p>
                <p>{tAbout('storyP3')}</p>
              </div>
              
              <div className="mt-12 flex flex-col items-start">
                <p className="text-[#1A1A1A] font-bold italic text-2xl mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {tAbout('founderName')}
                </p>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold">{tAbout('founderRole')}</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative z-10 shadow-2xl overflow-hidden rounded-sm">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1679309981674-cef0e23a7864"
                  alt={tAbout('storyPhotoAlt')}
                  className="w-full aspect-[4/5] object-cover"
                />
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 border-t-2 border-r-2 border-[#D4AF37] z-0" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 border-b-2 border-l-2 border-[#D4AF37] z-0" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-12 shadow-sm border-t-4 border-[#D4AF37]"
            >
              <div className="w-16 h-16 bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#D4AF37] mb-8">
                <Target size={32} />
              </div>
              <h3 
                className="text-[#1A1A1A] mb-4"
                style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif' }}
              >
                {tAbout('visionTitle')}
              </h3>
              <p className="text-gray-500 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {tAbout('visionText')}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#1A1A1A] p-12 shadow-sm border-t-4 border-[#D4AF37]"
            >
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#D4AF37] mb-8">
                <Compass size={32} />
              </div>
              <h3 
                className="text-white mb-4"
                style={{ fontSize: '28px', fontFamily: 'Playfair Display, serif' }}
              >
                {tAbout('missionTitle')}
              </h3>
              <p className="text-white/60 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {tAbout('missionText')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <h2 
              className="text-[#1A1A1A] mb-4"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              {tAbout('valuesHeading')}
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <Lightbulb size={32} />, titleKey: 'valueCreativityTitle' as const, descKey: 'valueCreativityDesc' as const },
              { icon: <ShieldCheck size={32} />, titleKey: 'valueQualityTitle' as const, descKey: 'valueQualityDesc' as const },
              { icon: <Users size={32} />, titleKey: 'valueCareTitle' as const, descKey: 'valueCareDesc' as const },
              { icon: <Award size={32} />, titleKey: 'valueTrustTitle' as const, descKey: 'valueTrustDesc' as const },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group"
              >
                <div className="w-16 h-16 mx-auto bg-[#F8F9FA] rounded-full flex items-center justify-center text-[#1A1A1A] mb-6 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500">
                  {item.icon}
                </div>
                <h4 className="text-[#1A1A1A] font-bold uppercase tracking-widest text-sm mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tAbout(item.titleKey)}
                </h4>
                <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tAbout(item.descKey)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 
              className="text-[#1A1A1A] mb-4"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              {tAbout('teamHeading')}
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37]" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                nameKey: 'team1Name' as const, 
                roleKey: 'team1Role' as const, 
                img: "https://images.unsplash.com/photo-1589127114212-b159197ebe6c",
                descKey: 'team1Desc' as const,
              },
              { 
                nameKey: 'team2Name' as const, 
                roleKey: 'team2Role' as const, 
                img: "https://images.unsplash.com/photo-1619799090425-0efe92bd62a7",
                descKey: 'team2Desc' as const,
              },
              { 
                nameKey: 'team3Name' as const, 
                roleKey: 'team3Role' as const, 
                img: "https://images.unsplash.com/photo-1765371512992-843e6a92d7e6",
                descKey: 'team3Desc' as const,
              },
            ].map((member, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="text-center group"
              >
                <div className="w-48 h-48 mx-auto mb-8 relative">
                  <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37] animate-[spin_10s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-full h-full rounded-full overflow-hidden shadow-xl border-4 border-white">
                    <ImageWithFallback
                      src={member.img}
                      alt={tAbout(member.nameKey)}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                    />
                  </div>
                </div>
                <h4 className="text-xl mb-1" style={{ fontFamily: 'Playfair Display, serif' }}>{tAbout(member.nameKey)}</h4>
                <p className="text-[#D4AF37] text-xs uppercase tracking-widest font-bold mb-4">{tAbout(member.roleKey)}</p>
                <p className="text-gray-500 text-sm px-4 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>{tAbout(member.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
            {[
              { value: 10, suffix: "+", labelKey: 'milestoneYears' as const },
              { value: 200, suffix: "+", labelKey: 'milestoneProjects' as const },
              { value: 50, suffix: "+", labelKey: 'milestonePartners' as const },
              { value: 15, suffix: "+", labelKey: 'milestoneAwards' as const },
            ].map((milestone, idx) => (
              <div key={idx}>
                <div 
                  className="text-[#D4AF37] mb-2 font-bold"
                  style={{ fontSize: '48px', fontFamily: 'Playfair Display, serif' }}
                >
                  <Counter value={milestone.value} suffix={milestone.suffix} />
                </div>
                <p className="text-white/50 text-xs uppercase tracking-[0.2em] font-bold">
                  {tAbout(milestone.labelKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto border-2 border-[#D4AF37] p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <MessageSquare size={120} className="text-[#D4AF37]" />
            </div>
            <h2 
              className="text-[#1A1A1A] mb-8"
              style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif' }}
            >
              {tAbout('ctaTitle')}
            </h2>
            <p className="text-gray-500 mb-12 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {tAbout('ctaBody')}
            </p>
            <Link 
              href="/contact"
              className="bg-[#D4AF37] text-white px-10 py-4 uppercase tracking-[0.2em] text-sm font-bold hover:bg-[#1A1A1A] transition-all duration-300 inline-flex items-center gap-4 group"
            >
              {tAbout('ctaButton')}
              <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}