"use client";

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { Calendar, ChevronLeft, MapPin, Share2, Trophy } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiNewsDetail } from '@/lib/cms-article-news';

type NewsTypeKey = 'news' | 'event' | 'community';

const typeTKey: Record<NewsTypeKey, 'typeNews' | 'typeEvent' | 'typeCommunity'> = {
  news: 'typeNews',
  event: 'typeEvent',
  community: 'typeCommunity',
};

function Breadcrumb({
  homeLabel,
  newsLabel,
  title,
}: {
  homeLabel: string;
  newsLabel: string;
  title: string;
}) {
  return (
    <nav className="max-w-[800px] mx-auto px-5 md:px-6 pt-6 pb-2" aria-label="Breadcrumb">
      <ol
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-['Montserrat',sans-serif] text-[#888888]"
      >
        <li>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">
            {homeLabel}
          </Link>
        </li>
        <li className="text-[#D4AF37]" aria-hidden>
          /
        </li>
        <li>
          <Link href="/news" className="hover:text-[#D4AF37] transition-colors">
            {newsLabel}
          </Link>
        </li>
        <li className="text-[#D4AF37]" aria-hidden>
          /
        </li>
        <li className="text-[#1A1A1A] line-clamp-2 max-w-[65vw]">{title}</li>
      </ol>
    </nav>
  );
}

function useShareUrl() {
  const [url, setUrl] = useState('');
  useEffect(() => {
    setUrl(typeof window !== 'undefined' ? window.location.href : '');
  }, []);
  return url;
}

export default function NewsDetailClient({ item }: { item: UiNewsDetail }) {
  const tNav = useTranslations('Nav');
  const tNews = useTranslations('News');
  const tDetail = useTranslations('NewsDetail');
  const typeKey = typeTKey[item.categoryKey] ?? 'typeNews';
  const badgeText = item.badgeLabel ?? tNews(typeKey);
  const shareUrl = useShareUrl();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const u = shareUrl || (typeof window !== 'undefined' ? window.location.href : '');
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, url: u });
      } catch {
        /* cancelled */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(u);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="bg-white text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <Breadcrumb
        homeLabel={tDetail('breadcrumbHome')}
        newsLabel={tNav('news')}
        title={item.title}
      />

      {/* Hero 450px */}
      <section className="relative w-full h-[450px] overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/15" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[800px] mx-auto px-5 md:px-6 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-[#1A1A1A] bg-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-2 mb-4">
              {badgeText}
            </span>
            <h1 className="font-['Playfair_Display',serif] text-[30px] sm:text-[38px] md:text-[44px] leading-[1.12] font-medium text-white">
              {item.title}
            </h1>
            <div className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6 text-white/85 text-[14px] font-light">
              {item.postedDateStr ? (
                <span>
                  {tDetail('postedLabel')}: {item.postedDateStr}
                </span>
              ) : null}
              {item.source ? (
                <span>
                  {tDetail('sourceLabel')}: {item.source}
                </span>
              ) : null}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article — max 800px, 17px / 1.7 */}
      <div className="max-w-[800px] mx-auto px-5 md:px-6 py-12 md:py-16">
        {item.lead ? (
          <p className="text-[17px] leading-[1.7] text-[#1A1A1A] font-normal mb-10">
            {item.lead}
          </p>
        ) : null}

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="news-prose max-w-none
            [&_p]:text-[17px] [&_p]:leading-[1.7] [&_p]:text-[#4A4A4A] [&_p]:mb-6
            [&_h2]:font-['Playfair_Display',serif] [&_h2]:text-[22px] md:[&_h2]:text-[24px] [&_h2]:text-[#1A1A1A] [&_h2]:font-medium [&_h2]:mt-10 [&_h2]:mb-4
            [&_figure]:my-10 [&_figcaption]:text-[13px] [&_figcaption]:text-[#888888] [&_figcaption]:mt-2 [&_figcaption]:text-center
            [&_img]:w-full [&_img]:object-cover [&_img]:rounded-sm
            [&_em]:italic [&_strong]:font-semibold [&_strong]:text-[#1A1A1A]
          "
        >
          {item.contentHtml ? <div dangerouslySetInnerHTML={{ __html: item.contentHtml }} /> : null}
        </motion.article>

        {item.eventInfo ? (
          <aside
            className="mt-14 p-6 md:p-8 bg-[#F8F9FA] border-l-4 border-[#D4AF37] space-y-4"
            aria-label={tDetail('eventBoxAria')}
          >
            {item.eventInfo.whenLine ? (
              <p className="flex gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                <Calendar size={20} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <span className="font-semibold text-[#1A1A1A]">{tDetail('eventWhen')}:</span>{' '}
                  {item.eventInfo.whenLine}
                </span>
              </p>
            ) : null}
            {item.eventInfo.venue ? (
              <p className="flex gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                <MapPin size={20} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <span className="font-semibold text-[#1A1A1A]">{tDetail('eventWhere')}:</span>{' '}
                  {item.eventInfo.venue}
                </span>
              </p>
            ) : null}
            {item.eventInfo.awardCategory ? (
              <p className="flex gap-3 text-[15px] text-[#4A4A4A] leading-relaxed">
                <Trophy size={20} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                <span>
                  <span className="font-semibold text-[#1A1A1A]">{tDetail('eventCategory')}:</span>{' '}
                  {item.eventInfo.awardCategory}
                </span>
              </p>
            ) : null}
          </aside>
        ) : null}

        <div className="mt-14 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-10 border-t border-gray-200">
          <Link
            href="/news"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-[#1A1A1A] text-[#1A1A1A] text-[12px] font-bold uppercase tracking-[0.12em] hover:bg-[#1A1A1A] hover:text-white transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
            {tDetail('backToNews')}
          </Link>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4AF37] text-white text-[12px] font-bold uppercase tracking-[0.12em] border-2 border-[#D4AF37] hover:bg-white hover:text-[#D4AF37] transition-colors"
          >
            <Share2 size={18} strokeWidth={1.5} />
            {copied ? tDetail('shareCopied') : tDetail('shareArticle')}
          </button>
        </div>
      </div>
    </div>
  );
}
