"use client";

import React, { useEffect, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Newspaper,
  Share2,
  Tag,
  Trophy,
} from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiNewsDetail, UiNewsListItem } from '@/lib/cms-article-news';
import { ContentTagLinks } from '@/components/ContentTagLinks';
import { sanitizeCmsHtml } from '@/lib/sanitize-cms-html';

type NewsTypeKey = 'news' | 'event' | 'community';

const typeTKey: Record<NewsTypeKey, 'typeNews' | 'typeEvent' | 'typeCommunity'> = {
  news: 'typeNews',
  event: 'typeEvent',
  community: 'typeCommunity',
};

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
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
    <nav
      className="absolute left-0 right-0 top-24 z-10 max-w-[1200px] mx-auto px-5 md:px-10"
      aria-label="Breadcrumb"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-['Montserrat',sans-serif] text-white/72">
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
        <li className="text-white line-clamp-2 max-w-[70vw] md:max-w-[36rem]">{title}</li>
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

function RelatedNewsCard({
  post,
  typeLabel,
  readMore,
}: {
  post: UiNewsListItem;
  typeLabel: string;
  readMore: string;
}) {
  return (
    <Link
      href={`/news/${post.slug}`}
      className="group block h-full bg-white border border-[#1A1A1A]/8 overflow-hidden hover:border-[#D4AF37]/45 hover:shadow-[0_20px_50px_rgba(26,26,26,0.08)] transition-all duration-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F8F9FA]">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
        />
        <span className="absolute left-4 top-4 bg-white/92 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[#1A1A1A] font-['Montserrat',sans-serif]">
          {typeLabel}
        </span>
      </div>
      <div className="p-6">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[#888888] mb-3 font-semibold font-['Montserrat',sans-serif]">
          {post.day} {post.monthYear}
        </p>
        <h3 className="font-['Playfair_Display',serif] text-[1.15rem] md:text-[1.25rem] text-[#1A1A1A] font-medium leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="mt-3 text-[13px] leading-[1.65] text-[#4A4A4A] font-light line-clamp-3">
          {post.summary}
        </p>
        <span className="inline-flex items-center gap-2 mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors font-['Montserrat',sans-serif]">
          {readMore}
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
    </Link>
  );
}

export default function NewsDetailClient({
  item,
  relatedPosts,
}: {
  item: UiNewsDetail;
  relatedPosts: UiNewsListItem[];
}) {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Nav');
  const tNews = useTranslations('News');
  const tDetail = useTranslations('NewsDetail');
  const typeKey = typeTKey[item.categoryKey] ?? 'typeNews';
  const typeLabel = tNews(typeKey);
  const badgeText = item.badgeLabel ?? typeLabel;
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
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <section className="relative w-full min-h-[430px] h-[min(58vh,560px)] overflow-hidden">
        <ImageWithFallback
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/92 via-[#1A1A1A]/48 to-[#1A1A1A]/16" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/32 to-transparent pointer-events-none" />
        <Breadcrumb
          homeLabel={tDetail('breadcrumbHome')}
          newsLabel={tNav('news')}
          title={item.title}
        />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-5 md:px-10 pb-11 md:pb-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
            className="text-white max-w-4xl"
          >
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-5">
              <span className="inline-flex items-center text-[#1A1A1A] bg-[#D4AF37] text-[10px] uppercase tracking-[0.22em] font-bold px-4 py-2">
                {badgeText}
              </span>
              {item.tags.slice(0, 2).map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${encodeURIComponent(tag.slug)}`}
                  className="inline-flex items-center gap-1.5 bg-white/12 border border-white/18 px-3 py-2 text-[10px] uppercase tracking-[0.16em] text-white/88 hover:border-[#D4AF37] hover:text-[#D4AF37] backdrop-blur-sm transition-colors"
                >
                  <Tag size={12} strokeWidth={1.6} />
                  {tag.name}
                </Link>
              ))}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              className="font-['Playfair_Display',serif] text-[clamp(1.9rem,5vw,3rem)] leading-[1.1] font-medium text-white drop-shadow-sm"
            >
              {item.title}
            </motion.h1>
            {item.summary ? (
              <motion.p
                variants={fadeUp}
                className="mt-5 text-white/86 text-[15px] md:text-[16px] leading-[1.75] max-w-3xl font-light"
              >
                {item.summary}
              </motion.p>
            ) : null}
            <motion.div
              variants={fadeUp}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-white/84 text-[12px] md:text-[13px] font-light"
            >
              {item.postedDateStr ? (
                <span className="inline-flex items-center gap-2">
                  <Calendar size={15} className="text-[#D4AF37]" strokeWidth={1.6} />
                  {item.postedDateStr}
                </span>
              ) : null}
              {item.source ? (
                <span className="inline-flex items-center gap-2">
                  <Newspaper size={15} className="text-[#D4AF37]" strokeWidth={1.6} />
                  {item.source}
                </span>
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-12 md:py-20">
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#888888] hover:text-[#D4AF37] transition-colors mb-12 group"
        >
          <ChevronLeft size={15} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          {tDetail('backToNews')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <main className="lg:col-span-8">
            {item.lead ? (
              <p className="text-[17px] md:text-[18px] leading-[1.85] text-[#4A4A4A] font-light mb-12 max-w-[44rem] border-l-2 border-[#D4AF37] pl-6 italic">
                {item.lead}
              </p>
            ) : null}

            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="news-prose max-w-[44rem]
                [&_p]:text-[17px] [&_p]:leading-[1.85] [&_p]:text-[#4A4A4A] [&_p]:font-light [&_p]:mb-7
                [&_a]:text-[#1A1A1A] [&_a]:border-b [&_a]:border-[#D4AF37] [&_a]:hover:text-[#D4AF37] [&_a]:transition-colors
                [&_h2]:font-['Playfair_Display',serif] [&_h2]:text-[1.5rem] md:[&_h2]:text-[1.7rem] [&_h2]:text-[#1A1A1A] [&_h2]:font-medium [&_h2]:mt-14 [&_h2]:mb-5
                [&_h3]:font-['Playfair_Display',serif] [&_h3]:text-[1.25rem] [&_h3]:text-[#1A1A1A] [&_h3]:font-medium [&_h3]:mt-10 [&_h3]:mb-4
                [&_blockquote]:my-12 [&_blockquote]:pl-6 [&_blockquote]:pr-4 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#D4AF37] [&_blockquote]:text-[1.125rem] md:[&_blockquote]:text-[1.25rem] [&_blockquote]:italic [&_blockquote]:text-[#1A1A1A]/90 [&_blockquote]:font-['Playfair_Display',serif] [&_blockquote]:leading-relaxed [&_blockquote]:bg-white/60 [&_blockquote]:py-4
                [&_figure]:my-12 [&_figcaption]:text-[12px] [&_figcaption]:text-[#888888] [&_figcaption]:mt-3 [&_figcaption]:text-center [&_figcaption]:font-light
                [&_img]:w-full [&_img]:object-cover [&_img]:rounded-sm
                [&_ul]:list-disc [&_ol]:list-decimal [&_ul]:pl-6 [&_ol]:pl-6 [&_ul]:text-[#4A4A4A] [&_ol]:text-[#4A4A4A] [&_ul]:mb-7 [&_ol]:mb-7
                [&_li]:mb-2 [&_li]:leading-[1.85] [&_li]:font-light
                [&_em]:italic [&_strong]:font-semibold [&_strong]:text-[#1A1A1A]
              "
            >
              {item.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(item.contentHtml) }} />
              ) : null}
            </motion.article>

            {item.tags.length > 0 ? (
              <div className="mt-14 pt-10 border-t border-[#1A1A1A]/10 max-w-[44rem]">
                <ContentTagLinks tags={item.tags} label={tNews('tagsLabel')} />
              </div>
            ) : null}

            <div className="mt-14 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between pt-10 border-t border-[#1A1A1A]/10 max-w-[44rem]">
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
          </main>

          <aside className="lg:col-span-4 space-y-8">
            <div className="lg:sticky lg:top-24 space-y-8">
              <section className="bg-white border border-[#1A1A1A]/8 p-7 md:p-8 shadow-[0_12px_40px_rgba(26,26,26,0.05)]">
                <h2 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium mb-6">
                  {tDetail('detailsTitle')}
                </h2>
                <dl className="space-y-5">
                  <div className="flex gap-3">
                    <Newspaper size={18} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold">
                        {tDetail('categoryLabel')}
                      </dt>
                      <dd className="mt-1 text-[14px] text-[#1A1A1A]">{typeLabel}</dd>
                    </div>
                  </div>
                  {item.postedDateStr ? (
                    <div className="flex gap-3">
                      <Clock size={18} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold">
                          {tDetail('postedLabel')}
                        </dt>
                        <dd className="mt-1 text-[14px] text-[#1A1A1A]">{item.postedDateStr}</dd>
                      </div>
                    </div>
                  ) : null}
                  {item.source ? (
                    <div className="flex gap-3">
                      <Newspaper size={18} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <dt className="text-[10px] uppercase tracking-[0.18em] text-[#888888] font-semibold">
                          {tDetail('sourceLabel')}
                        </dt>
                        <dd className="mt-1 text-[14px] text-[#1A1A1A]">{item.source}</dd>
                      </div>
                    </div>
                  ) : null}
                </dl>

                <button
                  type="button"
                  onClick={handleShare}
                  className="mt-7 w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1A1A1A] text-white text-[11px] font-bold uppercase tracking-[0.14em] hover:bg-[#D4AF37] transition-colors"
                >
                  <Share2 size={17} strokeWidth={1.5} />
                  {copied ? tDetail('shareCopied') : tDetail('shareArticle')}
                </button>
              </section>

              {item.eventInfo ? (
                <section
                  className="bg-white border border-[#1A1A1A]/8 border-l-4 border-l-[#D4AF37] p-7 md:p-8 space-y-5 shadow-[0_12px_40px_rgba(26,26,26,0.05)]"
                  aria-label={tDetail('eventBoxAria')}
                >
                  <h2 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium">
                    {tDetail('eventBoxAria')}
                  </h2>
                  {item.eventInfo.whenLine ? (
                    <p className="flex gap-3 text-[14px] text-[#4A4A4A] leading-relaxed">
                      <Calendar size={19} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>
                        <span className="font-semibold text-[#1A1A1A]">{tDetail('eventWhen')}:</span>{' '}
                        {item.eventInfo.whenLine}
                      </span>
                    </p>
                  ) : null}
                  {item.eventInfo.venue ? (
                    <p className="flex gap-3 text-[14px] text-[#4A4A4A] leading-relaxed">
                      <MapPin size={19} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>
                        <span className="font-semibold text-[#1A1A1A]">{tDetail('eventWhere')}:</span>{' '}
                        {item.eventInfo.venue}
                      </span>
                    </p>
                  ) : null}
                  {item.eventInfo.awardCategory ? (
                    <p className="flex gap-3 text-[14px] text-[#4A4A4A] leading-relaxed">
                      <Trophy size={19} className="text-[#D4AF37] shrink-0 mt-0.5" strokeWidth={1.5} />
                      <span>
                        <span className="font-semibold text-[#1A1A1A]">{tDetail('eventCategory')}:</span>{' '}
                        {item.eventInfo.awardCategory}
                      </span>
                    </p>
                  ) : null}
                </section>
              ) : null}

              {item.tags.length > 0 ? (
                <section className="bg-white border border-[#1A1A1A]/8 p-7 md:p-8 shadow-[0_12px_40px_rgba(26,26,26,0.05)]">
                  <h2 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium mb-5">
                    {tDetail('topicsTitle')}
                  </h2>
                  <ContentTagLinks tags={item.tags} />
                </section>
              ) : null}

              {relatedPosts.length > 0 ? (
                <section>
                  <h2 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium mb-5">
                    {tDetail('relatedTitle')}
                  </h2>
                  <ul className="space-y-5">
                    {relatedPosts.map((post) => (
                      <li key={post.id}>
                        <Link href={`/news/${post.slug}`} className="flex gap-4 group">
                          <div className="w-[76px] h-[76px] shrink-0 overflow-hidden bg-white">
                            <ImageWithFallback
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-[0.16em] text-[#888888] mb-1 font-semibold">
                              {post.day} {post.monthYear}
                            </p>
                            <h3 className="text-[14px] font-medium text-[#1A1A1A] leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-3">
                              {post.title}
                            </h3>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
            </div>
          </aside>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-24 pt-20 border-t border-[#1A1A1A]/10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#D4AF37] font-bold mb-3">
                  {tDetail('relatedEyebrow')}
                </p>
                <h2 className="font-['Playfair_Display',serif] text-[1.7rem] md:text-[1.95rem] text-[#1A1A1A] font-medium">
                  {tDetail('moreTitle')}
                </h2>
              </div>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#1A1A1A] hover:text-[#D4AF37] transition-colors font-semibold w-fit"
              >
                {tNav('news')}
                <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-8">
              {relatedPosts.map((post) => {
                const relatedTypeKey = typeTKey[post.categoryKey] ?? 'typeNews';
                return (
                  <RelatedNewsCard
                    key={post.id}
                    post={post}
                    typeLabel={tNews(relatedTypeKey)}
                    readMore={tCommon('readMore')}
                  />
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
