"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChevronRight, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiArticleDetail, UiArticleListItem } from '@/lib/cms-article-news';

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
};

function Breadcrumb({
  homeLabel,
  insightsLabel,
  title,
}: {
  homeLabel: string;
  insightsLabel: string;
  title: string;
}) {
  return (
    <nav
      className="max-w-[1200px] mx-auto px-6 md:px-12 pt-6 pb-2"
      aria-label="Breadcrumb"
    >
      <ol
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-['Montserrat',sans-serif]"
        style={{ color: '#888888' }}
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
          <Link href="/insights" className="hover:text-[#D4AF37] transition-colors">
            {insightsLabel}
          </Link>
        </li>
        <li className="text-[#D4AF37]" aria-hidden>
          /
        </li>
        <li className="text-[#1A1A1A] line-clamp-2 max-w-[70vw] md:max-w-none">{title}</li>
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
        label: 'Facebook',
        href: shareUrl ? `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` : '#',
      },
      {
        label: 'Zalo',
        href: shareUrl ? `https://zalo.me/share?url=${enc(shareUrl)}` : '#',
      },
      {
        label: 'LinkedIn',
        href: shareUrl
          ? `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}`
          : '#',
      },
      {
        label: 'Twitter',
        href: shareUrl
          ? `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}`
          : '#',
      },
    ],
    [shareUrl, title],
  );

  return (
    <div className="mt-14 pt-10 border-t border-gray-200">
      <p
        className="text-[14px] font-semibold uppercase tracking-[0.12em] text-[#1A1A1A] mb-4"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {t('shareTitle')}
      </p>
      <div className="flex flex-wrap gap-3">
        {links.map((l) => (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-w-[44px] h-11 px-4 border border-gray-300 bg-white text-[#4A4A4A] text-[11px] font-semibold uppercase tracking-wider hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
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
  const readTimeLabel =
    article.readingTimeMinutes != null
      ? tDetail('readTime', { minutes: article.readingTimeMinutes })
      : null;

  const socialFollow = [
    { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { Icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { Icon: MessageCircle, href: 'https://zalo.me', label: 'Zalo' },
    { Icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  return (
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <Breadcrumb
        homeLabel={tDetail('breadcrumbHome')}
        insightsLabel={tNav('insights')}
        title={article.title}
      />

      {/* Hero — 400px, gradient, badge, title, meta */}
      <section className="relative w-full h-[400px] overflow-hidden">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[1200px] mx-auto px-6 md:px-12 pb-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="text-white"
          >
            <motion.span
              variants={fade}
              className="inline-block text-[#D4AF37] text-[11px] uppercase tracking-[0.2em] font-bold bg-black/45 px-4 py-2 rounded-[20px] mb-4 backdrop-blur-sm"
            >
              {article.category}
            </motion.span>
            <motion.h1
              variants={fade}
              className="font-['Playfair_Display',serif] text-[28px] sm:text-[36px] md:text-[42px] leading-[1.15] font-medium max-w-4xl"
            >
              {article.title}
            </motion.h1>
            {article.description ? (
              <motion.p
                variants={fade}
                className="mt-4 text-white/85 text-[15px] leading-relaxed max-w-3xl font-light"
              >
                {article.description}
              </motion.p>
            ) : null}
            <motion.div
              variants={fade}
              className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/90 text-[13px] font-light"
            >
              <span>{article.date}</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/50" aria-hidden />
              <span>{article.author}</span>
              {readTimeLabel ? (
                <>
                  <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/50" aria-hidden />
                  <span>{readTimeLabel}</span>
                </>
              ) : null}
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-16">
        <Link
          href="/insights"
          className="inline-flex items-center text-[12px] uppercase tracking-[0.15em] font-semibold text-[#888888] hover:text-[#D4AF37] transition-colors mb-10"
        >
          <ChevronRight className="rotate-180 mr-2 shrink-0" size={14} />
          {tCommon('backToList')} — {tNav('insights')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-14">
          {/* Main 70% */}
          <div className="lg:col-span-7 order-1">
            {article.lead ? (
              <p
                className="text-[16px] leading-[1.8] text-[#4A4A4A] font-light mb-10"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {article.lead}
              </p>
            ) : null}

            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="article-rich max-w-none
                [&_p]:text-[16px] [&_p]:leading-[1.8] [&_p]:text-[#4A4A4A] [&_p]:font-light [&_p]:mb-6
                [&_h2]:font-['Playfair_Display',serif] [&_h2]:text-[26px] md:[&_h2]:text-[28px] [&_h2]:text-[#1A1A1A] [&_h2]:font-medium [&_h2]:mt-12 [&_h2]:mb-4
                [&_blockquote]:my-10 [&_blockquote]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-[#D4AF37] [&_blockquote]:text-[18px] md:[&_blockquote]:text-[20px] [&_blockquote]:italic [&_blockquote]:text-[#D4AF37] [&_blockquote]:font-['Montserrat',sans-serif]
                [&_figure]:my-8 [&_figcaption]:text-[13px] [&_figcaption]:text-[#888888] [&_figcaption]:mt-2 [&_figcaption]:text-center
                [&_img]:rounded-sm [&_img]:w-full [&_img]:my-0 [&_img]:object-cover
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-[#4A4A4A] [&_ul]:mb-6
                [&_li]:mb-2 [&_li]:leading-[1.8]
                [&_.article-stats]:grid [&_.article-stats]:grid-cols-1 sm:[&_.article-stats]:grid-cols-3 [&_.article-stats]:gap-4 [&_.article-stats]:my-10
                [&_.article-stats>div]:bg-white [&_.article-stats>div]:border [&_.article-stats>div]:border-gray-200 [&_.article-stats>div]:p-5 [&_.article-stats>div]:text-center
                [&_.article-stats>div>strong]:block [&_.article-stats>div>strong]:text-[#1A1A1A] [&_.article-stats>div>strong]:font-semibold [&_.article-stats>div>strong]:text-[14px] [&_.article-stats>div>strong]:mb-1
                [&_.article-stats>div>span]:text-[12px] [&_.article-stats>div>span]:text-[#4A4A4A] [&_.article-stats>div>span]:font-light
              "
            >
              {article.contentHtml ? (
                <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
              ) : null}
            </motion.article>

            {article.tags.length > 0 ? (
              <div className="mt-12 flex flex-wrap gap-2">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-widest px-3 py-1.5 border border-gray-200 bg-white text-[#4A4A4A]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <ShareRow title={article.title} />

            {/* Comments */}
            <section className="mt-16 pt-12 border-t border-gray-200">
              <h2
                className="font-['Playfair_Display',serif] text-[24px] text-[#1A1A1A] font-medium mb-8"
              >
                {tDetail('commentsTitle')}
              </h2>

              <form
                className="space-y-4 mb-12"
                onSubmit={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    required
                    placeholder={tDetail('commentName')}
                    className="w-full px-4 py-3 border border-gray-200 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors"
                  />
                  <input
                    type="email"
                    required
                    placeholder={tDetail('commentEmail')}
                    className="w-full px-4 py-3 border border-gray-200 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors"
                  />
                </div>
                <textarea
                  required
                  rows={4}
                  placeholder={tDetail('commentBody')}
                  className="w-full px-4 py-3 border border-gray-200 bg-white text-[14px] outline-none focus:border-[#D4AF37] transition-colors resize-y min-h-[120px]"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-white border-2 border-[#D4AF37] text-[#D4AF37] text-[12px] font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF37] hover:text-white transition-colors"
                >
                  {tDetail('commentSubmit')}
                </button>
                <p className="text-[12px] text-[#888888]">{tDetail('commentNote')}</p>
              </form>

              <ul className="space-y-8">
                <li className="border-l-2 border-[#D4AF37] pl-4">
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">
                    {tDetail('sampleAuthor1')}{' '}
                    <span className="font-normal text-[#888888]">· {tDetail('sampleDate1')}</span>
                  </p>
                  <p className="mt-2 text-[15px] text-[#4A4A4A] leading-relaxed font-light">
                    {tDetail('sampleBody1')}
                  </p>
                </li>
                <li className="border-l-2 border-[#D4AF37] pl-4">
                  <p className="text-[13px] font-semibold text-[#1A1A1A]">
                    {tDetail('sampleAuthor2')}{' '}
                    <span className="font-normal text-[#888888]">· {tDetail('sampleDate2')}</span>
                  </p>
                  <p className="mt-2 text-[15px] text-[#4A4A4A] leading-relaxed font-light">
                    {tDetail('sampleBody2')}
                  </p>
                </li>
              </ul>
            </section>
          </div>

          {/* Sidebar 30% */}
          <aside className="lg:col-span-3 order-2 lg:order-2 space-y-10">
            <div className="bg-white border border-gray-100 p-6 shadow-sm">
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 shrink-0 ring-2 ring-[#D4AF37]/30">
                  <ImageWithFallback
                    src={article.authorAvatar}
                    alt={article.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-['Playfair_Display',serif] text-[18px] text-[#1A1A1A] font-medium">
                    {article.author}
                  </p>
                  {article.authorRole ? (
                    <p className="text-[12px] text-[#D4AF37] font-semibold uppercase tracking-wider mt-1">
                      {article.authorRole}
                    </p>
                  ) : null}
                  {article.authorBio ? (
                    <p className="text-[13px] text-[#4A4A4A] leading-relaxed mt-3 font-light">
                      {article.authorBio}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            {relatedPosts.length > 0 ? (
              <div>
                <h3
                  className="text-[18px] font-bold text-[#1A1A1A] mb-4"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {tDetail('relatedTitle')}
                </h3>
                <ul className="space-y-4">
                  {relatedPosts.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/insights/${p.slug}`}
                        className="flex gap-3 group hover:opacity-90 transition-opacity"
                      >
                        <div className="w-[60px] h-[60px] shrink-0 overflow-hidden bg-gray-100">
                          <ImageWithFallback
                            src={p.image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <span className="text-[13px] font-medium text-[#1A1A1A] leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-3">
                          {p.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h3
                className="text-[18px] font-bold text-[#1A1A1A] mb-4"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {tDetail('followTitle')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {socialFollow.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="text-[#4A4A4A] hover:text-[#D4AF37] transition-colors p-2"
                  >
                    <Icon size={22} strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* More posts — full width below */}
        {relatedPosts.length > 0 ? (
          <section className="mt-20 pt-16 border-t border-gray-200">
            <h2
              className="font-['Playfair_Display',serif] text-[26px] md:text-[28px] text-[#1A1A1A] font-medium mb-10 text-center md:text-left"
            >
              {tDetail('moreTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
              {relatedPosts.map((p) => (
                <Link
                  key={p.id}
                  href={`/insights/${p.slug}`}
                  className="group block bg-white border border-gray-100 overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-lg transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden bg-gray-100">
                    <ImageWithFallback
                      src={p.image}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-[11px] uppercase tracking-wider text-[#888888] mb-2">
                      {p.date}
                    </p>
                    <h3 className="font-['Playfair_Display',serif] text-[18px] text-[#1A1A1A] font-medium leading-snug group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <span className="inline-block mt-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1A1A1A] border-b border-[#1A1A1A] pb-0.5 group-hover:text-[#D4AF37] group-hover:border-[#D4AF37] transition-colors">
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
