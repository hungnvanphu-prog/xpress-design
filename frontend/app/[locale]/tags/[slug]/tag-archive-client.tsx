'use client';

import { motion } from 'motion/react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowRight, Calendar, User, Building2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { TagArchiveCard } from './page';

export default function TagArchiveClient({
  tagName,
  cards,
}: {
  tagName: string;
  cards: TagArchiveCard[];
}) {
  const t = useTranslations('TagArchive');
  const tNav = useTranslations('Nav');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      <header className="relative overflow-hidden border-b border-[#1A1A1A]/08">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(90deg, #1A1A1A 0, #1A1A1A 1px, transparent 1px, transparent 80px)',
          }}
        />
        <div className="relative max-w-6xl mx-auto px-5 md:px-8 pt-16 pb-14 md:pt-24 md:pb-20">
          <nav className="mb-10 text-[10px] uppercase tracking-[0.22em] text-[#4A4A4A] font-['Montserrat',sans-serif]">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <li>
                <Link href="/" className="hover:text-[#D4AF37] transition-colors">
                  {t('breadcrumbHome')}
                </Link>
              </li>
              <li aria-hidden className="text-[#1A1A1A]/25">
                /
              </li>
              <li>
                <span className="text-[#1A1A1A]/70">{t('breadcrumbTags')}</span>
              </li>
            </ol>
          </nav>
          <p
            className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-[#D4AF37] mb-4 font-['Montserrat',sans-serif] font-semibold"
            style={{ letterSpacing: '0.28em' }}
          >
            {t('sectionEyebrow')}
          </p>
          <h1
            className="text-[clamp(2rem,5vw,3.25rem)] leading-[1.12] font-medium text-[#1A1A1A] max-w-4xl mb-6"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {tagName}
          </h1>
          <p className="text-[#4A4A4A] text-sm md:text-base max-w-2xl leading-relaxed font-light font-['Montserrat',sans-serif]">
            {t('fallbackDescription', { tag: tagName })}
          </p>
          <p className="mt-8 text-[10px] uppercase tracking-[0.28em] text-[#4A4A4A]/80 font-['Montserrat',sans-serif]">
            {t('philosophyLine')}
          </p>
          <p className="mt-3 text-[11px] text-[#1A1A1A]/55 font-['Montserrat',sans-serif]">
            {t('countLabel', { count: cards.length })}
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        {cards.length === 0 ? (
          <p className="text-center text-[#4A4A4A] font-['Montserrat',sans-serif] text-sm md:text-base py-16">
            {t('empty')}
          </p>
        ) : (
          <ul className="grid gap-10 md:gap-12 md:grid-cols-2 list-none p-0 m-0">
            {cards.map((card, i) => (
              <li key={card.key}>
                <ArchiveCard card={card} readMore={t('readMore')} index={i} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-20 pt-12 border-t border-[#1A1A1A]/10 flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center text-center sm:text-left">
          <Link
            href="/insights"
            className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#D4AF37] transition-colors font-['Montserrat',sans-serif] font-semibold"
          >
            ← {tNav('insights')}
          </Link>
          <Link
            href="/news"
            className="text-[11px] uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#D4AF37] transition-colors font-['Montserrat',sans-serif] font-semibold"
          >
            ← {tNav('news')}
          </Link>
        </div>
      </main>
    </div>
  );
}

function ArchiveCard({
  card,
  readMore,
  index,
}: {
  card: TagArchiveCard;
  readMore: string;
  index: number;
}) {
  const isNews = card.kind === 'news';
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: Math.min(index * 0.06, 0.24), ease: 'easeOut' }}
      className="group flex flex-col h-full bg-white border border-[#1A1A1A]/06 hover:border-[#D4AF37]/45 hover:shadow-[0_24px_48px_rgba(26,26,26,0.06)] transition-all duration-500"
    >
      <Link href={card.href} className="block">
        <div className="relative aspect-[4/3] overflow-hidden">
          <ImageWithFallback
            src={card.image}
            alt={card.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="bg-[#1A1A1A] text-[#F8F9FA] text-[9px] uppercase tracking-[0.18em] px-3 py-1.5 font-semibold font-['Montserrat',sans-serif]">
              {card.typeLabel}
            </span>
          </div>
        </div>
      </Link>
      <div className="p-6 md:p-7 flex flex-col flex-1">
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-[#4A4A4A] uppercase tracking-[0.14em] mb-4 font-semibold font-['Montserrat',sans-serif]"
        >
          <span className="inline-flex items-center gap-1.5">
            <Calendar size={12} className="text-[#D4AF37] shrink-0" aria-hidden />
            {card.dateDisplay}
          </span>
          <span className="inline-flex items-center gap-1.5 min-w-0">
            {isNews ? (
              <Building2 size={12} className="text-[#D4AF37] shrink-0" aria-hidden />
            ) : (
              <User size={12} className="text-[#D4AF37] shrink-0" aria-hidden />
            )}
            <span className="truncate">{card.metaLine}</span>
          </span>
        </div>
        <Link href={card.href} className="block mb-3">
          <h2
            className="text-[1.25rem] md:text-[1.35rem] leading-snug text-[#1A1A1A] line-clamp-2 transition-colors group-hover:text-[#D4AF37] font-medium"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            {card.title}
          </h2>
        </Link>
        <p className="text-[#4A4A4A] text-[14px] line-clamp-3 leading-[1.65] mb-6 font-light font-['Montserrat',sans-serif] flex-1">
          {card.excerpt}
        </p>
        <Link
          href={card.href}
          className="inline-flex items-center gap-2 text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#D4AF37] transition-colors mt-auto pb-1 border-b border-[#1A1A1A]/25 group-hover:border-[#D4AF37] font-['Montserrat',sans-serif] w-fit"
        >
          {readMore}
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}
