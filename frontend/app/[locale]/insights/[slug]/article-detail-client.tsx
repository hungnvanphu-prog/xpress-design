"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ArrowLeft, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiArticleDetail, UiArticleListItem } from '@/lib/cms-article-news';
import { ContentTagLinks } from '@/components/ContentTagLinks';
import { sanitizeCmsHtml } from '@/lib/sanitize-cms-html';

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function Breadcrumb({
  homeLabel,
  insightsLabel,
  title,
  ariaLabel,
}: {
  homeLabel: string;
  insightsLabel: string;
  title: string;
  ariaLabel: string;
}) {
  return (
    <nav
      className="max-w-[1200px] mx-auto px-5 md:px-10 pt-6 pb-2"
      aria-label={ariaLabel}
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-['Montserrat',sans-serif] text-[#888888]">
        <li>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">
            {homeLabel}
          </Link>
        </li>
        <li className="text-[#D4AF37]" aria-hidden>
          /
        </li>
        <li>
          <Link href="/insights" className="hover:text-[#D4AF37] transition-colors">
            {insightsLabel}
          </Link>
        </li>
        <li className="text-[#D4AF37]" aria-hidden>
          /
        </li>
        <li className="text-[#1A1A1A] line-clamp-2 max-w-[70vw] md:max-w-[36rem]">{title}</li>
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

function ShareRow({ title }: { title: string }) {
  const t = useTranslations('InsightsDetail');
  const shareUrl = useShareUrl();
  const enc = (s: string) => encodeURIComponent(s);

  const links = useMemo(
    () => [
      {
        label: t('networkFacebook'),
        href: shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` : '#',
      },
      {
        label: t('networkZalo'),
        href: shareUrl ? `https://zalo.me/share?url=${enc(shareUrl)}` : '#',
      },
      {
        label: t('networkLinkedIn'),
        href: shareUrl
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`
          : '#',
      },
      {
        label: t('networkTwitter'),
        href: shareUrl
          ? `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}`
          : '#',
      },
    ],
    [shareUrl, title, t],
  );

  return (
    <div className="mt-16 pt-12 border-t border-[#1A1A1A]/10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1A1A1A] mb-5 font-['Montserrat',sans-serif]">
        {t('shareTitle')}
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-w-[44px] h-10 px-4 border border-[#1A1A1A]/15 bg-white text-[#4A4A4A] text-[10px] font-semibold uppercase tracking-[0.14em] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-colors font-['Montserrat',sans-serif]"
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ArticleDetailClient({
  article,
  relatedPosts,
}: {
  article: UiArticleDetail;
  relatedPosts: UiArticleListItem[];
}) {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Nav');
  const tDetail = useTranslations('InsightsDetail');
  const tInsights = useTranslations('Insights');
  const readTimeLabel =
    article.readingTimeMinutes != null
      ? tDetail('readTime', { minutes: article.readingTimeMinutes })
      : null;

  const socialFollow = useMemo(
    () => [
      { Icon: Facebook, href: 'https://facebook.com', label: tDetail('networkFacebook') },
      { Icon: Instagram, href: 'https://instagram.com', label: tDetail('networkInstagram') },
      { Icon: MessageCircle, href: 'https://zalo.me', label: tDetail('networkZalo') },
      { Icon: Linkedin, href: 'https://linkedin.com', label: tDetail('networkLinkedIn') },
    ],
    [tDetail],
  );

  return (
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <Breadcrumb
        homeLabel={tDetail('breadcrumbHome')}
        insightsLabel={tNav('insights')}
        title={article.title}
        ariaLabel={tDetail('breadcrumbAriaLabel')}
      />

      {/* Hero — timeless, emotional */}
      <section className="relative w-full min-h-[420px] h-[min(52vh,520px)] overflow-hidden">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/92 via-[#1A1A1A]/45 to-[#1A1A1A]/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/25 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-5 md:px-10 pb-11 md:pb-14">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-white max-w-4xl"
          >
            <motion.span
              variants={fade}
              className="inline-flex items-center text-[#1A1A1A] bg-[#D4AF37] text-[10px] uppercase tracking-[0.22em] font-bold px-4 py-2 mb-5"
            >
              {article.category}
            </motion.span>
            <motion.h1
              variants={fade}
              className="font-['Playfair_Display',serif] text-[clamp(1.75rem,5vw,2.75rem)] leading-[1.12] font-medium text-white drop-shadow-sm"
            >
              {article.title}
            </motion.h1>
            {article.description ? (
              <motion.p
                variants={fade}
                className="mt-5 text-white/88 text-[15px] md:text-[16px] leading-[1.75] max-w-3xl font-light"
              >
                {article.description}
              </motion.p>
            ) : null}
            <motion.div
              variants={fade}
              className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-white/85 text-[12px] md:text-[13px] font-light tracking-wide"
            >
              <span className="tabular-nums">{article.date}</span>
              <span className="hidden sm:inline text-[#D4AF37]/90" aria-hidden>
                ·
              </span>
              <span>{article.author}</span>
              {readTimeLabel ? (
                <>
                  <span className="hidden sm:inline text-[#D4AF37]/90" aria-hidden>
                    ·
                  </span>
                  <span>{readTimeLabel}</span>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-5 md:px-10 py-12 md:py-20">
        <Link
          href="/insights"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold text-[#888888] hover:text-[#D4AF37] transition-colors mb-12 group font-['Montserrat',sans-serif]"
        >
          <ArrowLeft size={14} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          {tCommon('backToList')} — {tNav('insights')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-16">
          <div className="lg:col-span-8 order-1">
            {article.lead ? (
              <p className="text-[17px] md:text-[18px] leading-[1.85] text-[#4A4A4A] font-light mb-12 max-w-[42rem] font-['Montserrat',sans-serif] border-l-2 border-[#D4AF37] pl-6 italic">
                {article.lead}
              </p>
            ) : null}

            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="article-rich max-w-[42rem] font-['Montserrat',sans-serif]
                [&_p]:text-[17px] [&_p]:leading-[1.85] [&_p]:text-[#4A4A4A] [&_p]:font-light [&_p]:mb-7
                [&_h2]:font-['Playfair_Display',serif] [&_h2]:text-[1.5rem] md:[&_h2]:text-[1.65rem] [&_h2]:text-[#1A1A1A] [&_h2]:font-medium [&_h2]:mt-14 [&_h2]:mb-5 [&_h2]:tracking-tight
                [&_blockquote]:my-12 [&_blockquote]:pl-6 [&_blockquote]:pr-4 [&_blockquote]:border-l-[3px] [&_blockquote]:border-[#D4AF37] [&_blockquote]:text-[1.125rem] md:[&_blockquote]:text-[1.25rem] [&_blockquote]:italic [&_blockquote]:text-[#1A1A1A]/90 [&_blockquote]:font-['Playfair_Display',serif] [&_blockquote]:leading-relaxed [&_blockquote]:bg-white/50 [&_blockquote]:py-4
                [&_figure]:my-12 [&_figcaption]:text-[12px] [&_figcaption]:text-[#888888] [&_figcaption]:mt-3 [&_figcaption]:text-center [&_figcaption]:font-light
                [&_img]:rounded-sm [&_img]:w-full [&_img]:my-0 [&_img]:object-cover
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[#4A4A4A] [&_ul]:mb-7
                [&_li]:mb-2 [&_li]:leading-[1.85] [&_li]:font-light
                [&_.article-stats]:grid [&_.article-stats]:grid-cols-1 sm:[&_.article-stats]:grid-cols-3 [&_.article-stats]:gap-4 [&_.article-stats]:my-12
                [&_.article-stats>div]:bg-white [&_.article-stats>div]:border [&_.article-stats>div]:border-[#1A1A1A]/10 [&_.article-stats>div]:p-6 [&_.article-stats>div]:text-center
                [&_.article-stats>div>strong]:block [&_.article-stats>div>strong]:text-[#1A1A1A] [&_.article-stats>div>strong]:font-semibold [&_.article-stats>div>strong]:text-[13px] [&_.article-stats>div>strong]:mb-1 [&_.article-stats>div>strong]:font-['Montserrat',sans-serif]
                [&_.article-stats>div>span]:text-[11px] [&_.article-stats>div>span]:text-[#4A4A4A] [&_.article-stats>div>span]:font-light
                [&_.stats-grid]:grid [&_.stats-grid]:grid-cols-1 sm:[&_.stats-grid]:grid-cols-3 [&_.stats-grid]:gap-4 [&_.stats-grid]:my-12
                [&_.stats-grid_.stat]:bg-white [&_.stats-grid_.stat]:border [&_.stats-grid_.stat]:border-[#1A1A1A]/10 [&_.stats-grid_.stat]:p-6 [&_.stats-grid_.stat]:text-center
                [&_.stats-grid_.stat]:font-['Playfair_Display',serif] [&_.stats-grid_.stat]:text-[#1A1A1A] [&_.stats-grid_.stat]:text-[15px] md:[&_.stats-grid_.stat]:text-[17px] [&_.stats-grid_.stat]:font-medium [&_.stats-grid_.stat]:leading-snug
              "
            >
              {article.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(article.contentHtml) }} />
              ) : null}
            </motion.article>

            {article.tags.length > 0 ? (
              <div className="mt-14 pt-10 border-t border-[#1A1A1A]/10 max-w-[42rem]">
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#888888] mb-4 font-semibold">
                  {tInsights('tagsLabel')}
                </p>
                <ContentTagLinks tags={article.tags} />
              </div>
            ) : null}

            <ShareRow title={article.title} />

            <section className="mt-20 pt-14 border-t border-[#1A1A1A]/10">
              <h2 className="font-['Playfair_Display',serif] text-[1.5rem] md:text-[1.65rem] text-[#1A1A1A] font-medium mb-10">
                {tDetail('commentsTitle')}
              </h2>

              <form
                className="space-y-4 mb-14 max-w-2xl"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder={tDetail('commentName')}
                    className="w-full px-4 py-3.5 border border-[#1A1A1A]/12 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors font-light"
                  />
                  <input
                    type="email"
                    required
                    placeholder={tDetail('commentEmail')}
                    className="w-full px-4 py-3.5 border border-[#1A1A1A]/12 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors font-light"
                  />
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={tDetail('commentBody')}
                  className="w-full px-4 py-3.5 border border-[#1A1A1A]/12 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors resize-y min-h-[120px] font-light"
                />
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#D4AF37] text-white text-[11px] font-bold uppercase tracking-[0.18em] border-2 border-[#D4AF37] hover:bg-white hover:text-[#D4AF37] transition-colors font-['Montserrat',sans-serif]"
                >
                  {tDetail('commentSubmit')}
                </button>
                <p className="text-[12px] text-[#888888] font-light">{tDetail('commentNote')}</p>
              </form>

              <ul className="space-y-10 max-w-2xl">
                <li className="border-l-[3px] border-[#D4AF37] pl-5 bg-white/60 py-1">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] font-['Montserrat',sans-serif]">
                    {tDetail('sampleAuthor1')}{' '}
                    <span className="font-normal text-[#888888]">· {tDetail('sampleDate1')}</span>
                  </p>
                  <p className="mt-2 text-[15px] text-[#4A4A4A] leading-[1.8] font-light">
                    {tDetail('sampleBody1')}
                  </p>
                </li>
                <li className="border-l-[3px] border-[#D4AF37] pl-5 bg-white/60 py-1">
                  <p className="text-[13px] font-semibold text-[#1A1A1A] font-['Montserrat',sans-serif]">
                    {tDetail('sampleAuthor2')}{' '}
                    <span className="font-normal text-[#888888]">· {tDetail('sampleDate2')}</span>
                  </p>
                  <p className="mt-2 text-[15px] text-[#4A4A4A] leading-[1.8] font-light">
                    {tDetail('sampleBody2')}
                  </p>
                </li>
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4 order-2 space-y-10">
            <div className="bg-white border border-[#1A1A1A]/8 p-8 shadow-[0_12px_40px_rgba(26,26,26,0.06)]">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-5">
                <div className="w-[88px] h-[88px] rounded-full overflow-hidden bg-[#F8F9FA] shrink-0 ring-2 ring-[#D4AF37]/35">
                  <ImageWithFallback
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium leading-snug">
                    {article.author}
                  </p>
                  {article.authorRole ? (
                    <p className="text-[11px] text-[#D4AF37] font-bold uppercase tracking-[0.14em] mt-2 font-['Montserrat',sans-serif]">
                      {article.authorRole}
                    </p>
                  ) : null}
                  {article.authorBio ? (
                    <p className="text-[13px] text-[#4A4A4A] leading-[1.75] mt-4 font-light">
                      {article.authorBio}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {relatedPosts.length > 0 ? (
              <div>
                <h3 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium mb-6">
                  {tDetail('relatedTitle')}
                </h3>
                <ul className="space-y-5">
                  {relatedPosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/insights/${p.slug}`}
                        className="flex gap-4 group hover:opacity-95 transition-opacity"
                      >
                        <div className="w-[72px] h-[72px] shrink-0 overflow-hidden bg-[#F8F9FA]">
                          <ImageWithFallback
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <span className="text-[14px] font-medium text-[#1A1A1A] leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-3 font-['Montserrat',sans-serif]">
                          {p.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3 className="font-['Playfair_Display',serif] text-[1.25rem] text-[#1A1A1A] font-medium mb-5">
                {tDetail('followTitle')}
              </h3>
              <div className="flex flex-wrap gap-1">
                {socialFollow.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-[#4A4A4A] hover:text-[#D4AF37] transition-colors p-2.5"
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {relatedPosts.length > 0 ? (
          <section className="mt-24 pt-20 border-t border-[#1A1A1A]/10">
            <h2 className="font-['Playfair_Display',serif] text-[1.65rem] md:text-[1.85rem] text-[#1A1A1A] font-medium mb-12 text-center md:text-left">
              {tDetail('moreTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/insights/${p.slug}`}
                  className="group block bg-white border border-[#1A1A1A]/8 overflow-hidden hover:border-[#D4AF37]/45 hover:shadow-[0_20px_50px_rgba(26,26,26,0.08)] transition-all duration-500"
                >
                  <div className="aspect-video overflow-hidden bg-[#F8F9FA]">
                    <ImageWithFallback
                      src={p.image}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#888888] mb-3 font-semibold font-['Montserrat',sans-serif]">
                      {p.date}
                    </p>
                    <h3 className="font-['Playfair_Display',serif] text-[1.125rem] text-[#1A1A1A] font-medium leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <span className="inline-block mt-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors font-['Montserrat',sans-serif]">
                      {tCommon('readMore')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
