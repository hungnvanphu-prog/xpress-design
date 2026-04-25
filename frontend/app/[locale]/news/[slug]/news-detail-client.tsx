"use client";

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Calendar, ChevronRight, MapPin } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiNewsDetail } from '@/lib/cms-article-news';

type NewsTypeKey = 'news' | 'event' | 'community';

const typeTKey: Record<NewsTypeKey, 'typeNews' | 'typeEvent' | 'typeCommunity'> = {
  news: 'typeNews',
  event: 'typeEvent',
  community: 'typeCommunity',
};

function formatDetailDate(iso: string | null, locale: string) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    dateStyle: 'long',
  }).format(d);
}

export default function NewsDetailClient({
  item,
  locale,
}: {
  item: UiNewsDetail;
  locale: string;
}) {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Nav');
  const tNews = useTranslations('News');
  const typeKey = typeTKey[item.categoryKey] ?? 'typeNews';
  const when = formatDetailDate(item.eventDateIso, locale);

  return (
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <section className="relative w-full h-[45vh] md:h-[55vh]">
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[900px] mx-auto px-6 md:px-12 pb-10">
          <span className="inline-block text-[#1A1A1A] bg-[#D4AF37] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 mb-4">
            {tNews(typeKey)}
          </span>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-['Playfair_Display',serif] text-[28px] md:text-[44px] leading-[1.15] font-medium text-white"
          >
            {item.title}
          </motion.h1>
          <div className="mt-4 flex flex-wrap gap-4 text-white/80 text-[13px]">
            {when ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar size={16} className="text-[#D4AF37]" /> {when}
              </span>
            ) : null}
            {item.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={16} className="text-[#D4AF37]" /> {item.location}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 py-10 md:py-16">
        <Link
          href="/news"
          className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A4A4A] hover:text-[#D4AF37] transition-colors mb-12"
        >
          <ChevronRight className="rotate-180 mr-2" size={14} /> {tCommon('backToList')} — {tNav('news')}
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-neutral prose-lg max-w-none
            prose-p:text-[#4A4A4A] prose-p:leading-[1.85] prose-p:font-light
            prose-a:text-[#B8942E] prose-li:text-[#4A4A4A]"
        >
          {item.contentHtml ? <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} /> : null}
        </motion.article>
      </div>
    </div>
  );
}
