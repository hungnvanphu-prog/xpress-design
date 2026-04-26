"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { PageHero } from '@/components/PageHero';
import { 
  CheckCircle2, 
  ChevronDown, 
  ArrowRight, 
  PencilRuler, 
  Home, 
  Hammer, 
  RefreshCcw,
  MessageSquare,
  FileText,
  MousePointer2,
  HardHat,
  Key
} from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group transition-all duration-300"
      >
        <span className={`text-lg font-medium transition-colors duration-300 ${isOpen ? 'text-[#D4AF37]' : 'text-[#1A1A1A] group-hover:text-[#D4AF37]'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
          {question}
        </span>
        <ChevronDown 
          size={20} 
          className={`text-[#D4AF37] transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <p className="text-gray-500 pb-8 leading-relaxed pr-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

type ServiceCardMsg = { title: string; desc: string; highlights: string[] };
type ProcessStepMsg = { number: string; title: string; desc: string };
type FaqItemMsg = { question: string; answer: string };

const SERVICE_CARD_KEYS = [
  "architecture",
  "interior",
  "turnkey",
  "renovation",
] as const;

const SERVICE_ICONS = [
  <PencilRuler key="i0" size={32} />,
  <Home key="i1" size={32} />,
  <Hammer key="i2" size={32} />,
  <RefreshCcw key="i3" size={32} />,
];

const SERVICE_IMAGES = [
  "https://images.unsplash.com/photo-1746458258536-b9ee5db20a73",
  "https://images.unsplash.com/photo-1728488448472-16a259c6ba7c",
  "https://images.unsplash.com/photo-1606745994328-4ed824ded494",
  "https://images.unsplash.com/photo-1633354990288-2bfe9967da76",
];

const PROCESS_STEP_ICONS = [
  <MessageSquare key="p0" size={24} />,
  <FileText key="p1" size={24} />,
  <MousePointer2 key="p2" size={24} />,
  <HardHat key="p3" size={24} />,
  <Key key="p4" size={24} />,
];

export default function Services() {
  const tNav = useTranslations('Nav');
  const tPage = useTranslations('PageTitles');
  const tTag = useTranslations('HeroTaglines');
  const tSvc = useTranslations('ServicesPage');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const processSteps = tSvc.raw('processSteps') as ProcessStepMsg[];
  const faqItems = tSvc.raw('faqItems') as FaqItemMsg[];

  return (
    <div className="bg-white">
      <PageHero
        image="https://images.unsplash.com/photo-1582057811341-a22d524c6a4c"
        title={tPage('services')}
        breadcrumb={tNav('services')}
        homeLabel={tNav('home')}
        tagline={tTag('services')}
        alt={tSvc('heroImageAlt')}
      />

      {/* Overview Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-[#1A1A1A] mb-8" style={{ fontSize: '32px', fontFamily: 'Playfair Display, serif' }}>
              {tSvc('overviewTitle')}
            </h2>
            <p className="text-gray-500 leading-relaxed text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {tSvc('overviewBody')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24 bg-[#F8F9FA]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {SERVICE_CARD_KEYS.map((key, idx) => {
              const service = tSvc.raw(`cards.${key}`) as ServiceCardMsg;
              return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white flex flex-col md:flex-row shadow-sm hover:shadow-xl transition-shadow duration-500 overflow-hidden group"
              >
                <div className="md:w-1/2 overflow-hidden relative">
                  <ImageWithFallback
                    src={SERVICE_IMAGES[idx]}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6 bg-white/90 p-3 text-[#1A1A1A] rounded-sm">
                    {SERVICE_ICONS[idx]}
                  </div>
                </div>
                <div className="md:w-1/2 p-10 flex flex-col justify-between">
                  <div>
                    <h3 className="text-2xl mb-4 text-[#1A1A1A]" style={{ fontFamily: 'Playfair Display, serif' }}>
                      {service.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {service.desc}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.highlights.map((h, i) => (
                        <li key={i} className="flex items-center text-xs text-gray-700 font-medium">
                          <CheckCircle2 size={16} className="text-[#D4AF37] mr-3 shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button type="button" className="flex items-center text-[#D4AF37] text-xs uppercase tracking-widest font-bold group/btn">
                    {tSvc('learnMore')}
                    <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-2 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );})}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="text-white mb-4" style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}>
              {tSvc('processTitle')}
            </h2>
            <div className="w-24 h-1 bg-[#D4AF37] mx-auto" />
          </div>

          <div className="relative">
            {/* Desktop Line */}
            <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-white/10 z-0" />
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 relative z-10">
              {processSteps.map((step, idx) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.15 }}
                  className="text-center group"
                >
                  <div className="w-24 h-24 mx-auto rounded-full bg-[#2A2A2A] border border-white/5 flex items-center justify-center text-[#D4AF37] mb-8 group-hover:bg-[#D4AF37] group-hover:text-white transition-all duration-500 relative">
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-[#D4AF37] text-white w-6 h-6 rounded-full flex items-center justify-center group-hover:bg-white group-hover:text-[#1A1A1A]">
                      {step.number}
                    </span>
                    {PROCESS_STEP_ICONS[idx]}
                  </div>
                  <h4 className="text-lg mb-4 text-white" style={{ fontFamily: 'Playfair Display, serif' }}>{step.title}</h4>
                  <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div>
              <h2 className="text-[#1A1A1A] mb-8" style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}>
                {tSvc('faqTitle')}
              </h2>
              <p className="text-gray-500 mb-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {tSvc('faqIntro')}
              </p>
              <div className="p-10 bg-[#F8F9FA] border-l-4 border-[#D4AF37]">
                <p className="text-[#1A1A1A] italic leading-relaxed" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {tSvc('faqQuote')}
                </p>
                <p className="mt-4 font-bold text-[#D4AF37] uppercase tracking-widest text-xs">{tSvc('faqQuoteAttribution')}</p>
              </div>
            </div>

            <div>
              {faqItems.map((item, i) => (
                <FAQItem key={i} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 
              className="text-white mb-8"
              style={{ fontSize: '36px', fontFamily: 'Playfair Display, serif' }}
            >
              {tSvc('ctaTitleLine1')} <br /> {tSvc('ctaTitleLine2')}
            </h2>
            <p className="text-white/50 mb-12 text-lg" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {tSvc('ctaBody')}
            </p>
            <Link 
              href="/contact"
              className="bg-[#D4AF37] text-white px-12 py-5 uppercase tracking-[0.2em] text-sm font-bold hover:bg-white hover:text-[#1A1A1A] transition-all duration-500 inline-block"
            >
              {tSvc('ctaButton')}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}