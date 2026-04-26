"use client";

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from "motion/react";

export default function NotFound() {
  const pathname = usePathname() ?? "/";
  const pathName = pathname.replace('/', '').toUpperCase() || '404';
  const t = useTranslations('NotFound');

  return (
    <div
      className="min-h-[80vh] flex flex-col items-center justify-center bg-[#F8F9FA] px-6 py-32"
      data-e2e="not-found"
    >
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#D4AF37] text-[10px] font-bold tracking-[0.2em] uppercase mb-6 block border border-[#D4AF37] px-4 py-2 inline-block bg-[#D4AF37]/5">
            {t('badge')}
          </span>
          <h1 className="font-['Playfair_Display',serif] text-3xl md:text-5xl text-[#1A1A1A] mb-8 font-medium">
            {pathName}
          </h1>
          <p className="text-[#4A4A4A] text-[15px] font-light leading-relaxed mb-12">
            {t('description')}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-[#1A1A1A] text-[#1A1A1A] px-8 py-4 uppercase tracking-[0.15em] text-xs font-semibold hover:bg-[#1A1A1A] hover:text-white transition-colors duration-300"
          >
            {t('backHome')}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}