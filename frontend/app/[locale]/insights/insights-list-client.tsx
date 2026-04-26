"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiArticleListItem } from '@/lib/cms-article-news';
import { api } from '@/lib/api';
import ListPagination from '@/components/ListPagination';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight,
  Download,
  CheckCircle2,
  TrendingUp,
  Zap,
  PlayCircle
} from 'lucide-react';

function BlogCard({ post, readMoreLabel }: { post: UiArticleListItem; readMoreLabel: string }) {
  return (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="group flex flex-col h-full bg-white p-6 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] hover:scale-[1.02] transition-all duration-500"
  >
    <Link href={`/insights/${post.slug}`} className="block">
      <div className="relative aspect-[4/3] overflow-hidden mb-6 -mx-6 -mt-6">
        <ImageWithFallback
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 bg-[#D4AF37] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold px-3 py-1">
          {post.category}
        </div>
      </div>
    </Link>
    <div className="flex items-center gap-4 text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <span className="flex items-center gap-1.5"><Calendar size={12} className="text-[#D4AF37]" /> {post.date}</span>
      <span className="flex items-center gap-1.5"><User size={12} className="text-[#D4AF37]" /> {post.author}</span>
    </div>
    <Link href={`/insights/${post.slug}`} className="block mb-3">
      <h3 className="text-[20px] md:text-[22px] leading-snug text-[#1A1A1A] line-clamp-2 transition-colors group-hover:text-[#D4AF37] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
        {post.title}
      </h3>
    </Link>
    <p className="text-[#4A4A4A] text-[14px] line-clamp-3 leading-[1.6] mb-4 font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {post.description}
    </p>
    {post.tags.length > 0 ? (
      <div className="flex flex-wrap gap-1.5 mb-5">
        {post.tags.slice(0, 4).map((tag) => (
          <Link
            key={tag.slug}
            href={`/tags/${encodeURIComponent(tag.slug)}`}
            className="text-[9px] uppercase tracking-wider text-[#888888] hover:text-[#D4AF37] px-2 py-0.5 border border-[#1A1A1A]/10 hover:border-[#D4AF37]/50 bg-[#F8F9FA]/80 transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
            onClick={(e) => e.stopPropagation()}
          >
            {tag.name}
          </Link>
        ))}
      </div>
    ) : null}
    <div className="mt-auto">
      <Link href={`/insights/${post.slug}`} className="inline-flex items-center gap-2 text-[#1A1A1A] text-[11px] font-semibold uppercase tracking-[0.15em] group-hover:text-[#D4AF37] transition-colors pb-1 border-b border-[#1A1A1A] group-hover:border-[#D4AF37]">
        {readMoreLabel} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </motion.div>
  );
}

const GRID_PAGE_SIZE = 9;

export default function InsightsListClient({ posts }: { posts: UiArticleListItem[] }) {
  const t = useTranslations('Insights');
  const locale = useLocale();
  const allLabel = t('filterAll');
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const tagSlug = (urlSearchParams.get('tag') || '').trim().toLowerCase();
  const [searchQuery, setSearchQuery] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [footerName, setFooterName] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [reportOk, setReportOk] = useState(false);
  const [footerOk, setFooterOk] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(allLabel);

  const stripPageFromUrl = useCallback(() => {
    const q = new URLSearchParams(urlSearchParams.toString());
    if (!q.has('page')) return;
    q.delete('page');
    const s = q.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }, [pathname, router, urlSearchParams]);

  useEffect(() => {
    setActiveCategory(allLabel);
  }, [allLabel]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = useMemo(
    () => [allLabel, ...Array.from(new Set(posts.map((p) => p.category)))],
    [allLabel, posts],
  );

  const activeTagName = useMemo(() => {
    if (!tagSlug) return '';
    for (const p of posts) {
      const hit = p.tags.find((t) => t.slug === tagSlug);
      if (hit) return hit.name;
    }
    return tagSlug;
  }, [posts, tagSlug]);

  const filtered = useMemo(() => {
    let p = posts;
    if (activeCategory !== allLabel) p = p.filter((x) => x.category === activeCategory);
    if (tagSlug) {
      p = p.filter((x) => x.tags.some((t) => t.slug === tagSlug));
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      p = p.filter(
        (x) =>
          x.title.toLowerCase().includes(q) || x.description.toLowerCase().includes(q),
      );
    }
    return p;
  }, [posts, activeCategory, searchQuery, allLabel, tagSlug]);

  const remainder = Math.max(0, filtered.length - 2);
  const totalGridPages = Math.max(1, Math.ceil(remainder / GRID_PAGE_SIZE) || 1);
  const requestedPage = Math.max(1, parseInt(urlSearchParams.get('page') || '1', 10) || 1);
  const currentPage = Math.min(requestedPage, totalGridPages);

  const featuredArticles = currentPage === 1 ? filtered.slice(0, 2) : [];
  const gridStart = 2 + (currentPage - 1) * GRID_PAGE_SIZE;
  const listPosts = filtered.slice(gridStart, gridStart + GRID_PAGE_SIZE);

  const handleReportSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = reportEmail.trim();
    if (!em) return;
    setSignupError(null);
    setReportLoading(true);
    try {
      await api.cmsInsightSignup({
        email: em,
        source: 'insights_feature_report',
        locale,
      });
      setReportOk(true);
      setReportEmail('');
      setTimeout(() => setReportOk(false), 4000);
    } catch {
      setSignupError(t('signupError'));
    } finally {
      setReportLoading(false);
    }
  };

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const em = footerEmail.trim();
    if (!em) return;
    setSignupError(null);
    setFooterLoading(true);
    try {
      await api.cmsInsightSignup({
        email: em,
        source: 'insights_newsletter',
        name: footerName.trim() || undefined,
        locale,
      });
      setFooterOk(true);
      setFooterEmail('');
      setFooterName('');
      setTimeout(() => setFooterOk(false), 4000);
    } catch {
      setSignupError(t('signupError'));
    } finally {
      setFooterLoading(false);
    }
  };

  return (
    <div className="bg-white w-full" data-e2e="page-insights">
      {/* 1. Hero Section (Upgraded) */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1758565811522-86b7ba4d5300?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMHBvb2wlMjBvcGVuJTIwbGl2aW5nJTIwcm9vbXxlbnwxfHx8fDE3NzYyNDMxNjN8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt={t('heroImageAlt')}
            className="w-full h-full object-cover scale-105 opacity-40 mix-blend-luminosity"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A]/80 to-transparent" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20">
          <motion.div
             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          >
            <span className="text-[#D4AF37] text-[12px] uppercase tracking-[0.3em] font-bold mb-6 block">
              {t('heroEyebrow')}
            </span>
            <h1 className="text-white mb-8 text-[40px] md:text-[56px] leading-[1.2] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('heroTitleBeforeBreak')}{' '}
              <br className="hidden md:block" />
              {t('heroTitleAfterBreak')}
            </h1>
            <p className="text-white/80 text-[16px] md:text-[18px] leading-[1.8] font-light max-w-3xl mx-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('heroSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Filter Bar */}
      <section className="bg-white py-6 border-b border-gray-100 sticky top-[80px] z-40 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-wrap items-center gap-2 md:gap-6 text-[11px] uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {categories.map((cat) => (
              <button 
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  stripPageFromUrl();
                }}
                className={`pb-1 px-2 transition-colors ${
                  activeCategory === cat 
                    ? "text-[#1A1A1A] border-b-2 border-[#D4AF37]" 
                    : "text-gray-400 hover:text-[#1A1A1A] border-b-2 border-transparent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="relative w-full md:w-64 mt-4 md:mt-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#F8F9FA] border border-transparent focus:border-[#D4AF37] outline-none transition-colors text-[13px] rounded-none"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            />
          </div>
        </div>
      </section>

      {tagSlug ? (
        <div className="bg-[#F8F9FA] border-b border-[#1A1A1A]/8 py-3.5">
          <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex flex-wrap items-center justify-center gap-3 text-[13px] font-['Montserrat',sans-serif]">
            <span className="text-[#4A4A4A]">
              {t('filteringByTag')}:{' '}
              <strong className="text-[#1A1A1A] font-semibold">{activeTagName}</strong>
            </span>
            <Link
              href="/insights"
              className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.14em] hover:underline"
            >
              {t('clearTagFilter')}
            </Link>
          </div>
        </div>
      ) : null}

      {/* 3. Báo cáo đặc biệt (Feature Report) */}
      <section className="py-20 md:py-24 bg-white relative z-30">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            className="bg-[#1A1A1A] flex flex-col lg:flex-row overflow-hidden shadow-2xl"
          >
            <div className="lg:w-1/2 p-10 md:p-16 flex flex-col justify-center relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 bg-[#D4AF37] text-[#1A1A1A] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 px-4 py-2 w-max">
                {t('reportBadge')}
              </div>
              
              <h2 className="text-3xl md:text-[40px] text-white mb-6 leading-[1.2] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t('reportTitle')}
              </h2>
              
              <p className="text-white/70 text-[15px] mb-10 leading-[1.8] font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('reportSubtitle')}
              </p>
              
              {signupError ? (
                <p className="text-red-300 text-[13px] mb-3 font-['Montserrat',sans-serif]">{signupError}</p>
              ) : null}
              <form onSubmit={handleReportSubscribe} className="flex flex-col sm:flex-row gap-3 relative z-10">
                <div className="flex-1 relative">
                  <input 
                    type="email" 
                    required
                    value={reportEmail}
                    onChange={(e) => setReportEmail(e.target.value)}
                    placeholder={t('reportEmailPlaceholder')}
                    className="w-full bg-white/5 border border-white/20 text-white px-6 py-4 outline-none focus:border-[#D4AF37] transition-colors text-[14px] font-light placeholder:text-white/40"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                    disabled={reportLoading}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={reportLoading}
                  className="bg-[#D4AF37] text-[#1A1A1A] px-8 py-4 uppercase tracking-[0.15em] text-[12px] font-bold hover:bg-white transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-60"
                >
                  {reportOk ? <CheckCircle2 size={16} /> : reportLoading ? null : <Download size={16} />}
                  {reportOk ? t('signupReportOk') : reportLoading ? t('signupSending') : t('reportDownloadCta')}
                </button>
              </form>
              <p className="text-white/40 text-[11px] mt-4 font-light flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <CheckCircle2 size={12} className="text-[#D4AF37]" /> {t('reportSpamNote')}
              </p>
            </div>
            
            <div className="lg:w-1/2 relative h-[400px] lg:h-auto bg-[#2A2A2A]">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB2aWxsYSUyMGV4dGVyaW9yfGVufDF8fHx8MTc3NjI0MzM1Mnww&ixlib=rb-4.1.0&q=80&w=1080"
                alt={t('reportCoverAlt')}
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
              />
              {/* Mockup Book UI Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <div className="w-[280px] h-[380px] bg-white shadow-2xl flex flex-col border-l-[12px] border-[#1A1A1A] relative rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out origin-bottom-left cursor-pointer">
                  <div className="p-8 flex flex-col h-full bg-[#F8F9FA]">
                    <span className="text-[#D4AF37] text-[8px] font-bold tracking-[0.2em] mb-4">{t('reportMockBrand')}</span>
                    <h3 className="font-['Playfair_Display',serif] text-2xl text-[#1A1A1A] leading-tight mb-auto whitespace-pre-line">
                      {t('reportMockTitle')}
                    </h3>
                    <div className="w-8 h-[2px] bg-[#D4AF37] mt-8" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. Bài viết nổi bật (Featured Articles) */}
      {featuredArticles.length > 0 ? (
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center gap-4 mb-12">
            <span className="w-12 h-[1px] bg-[#D4AF37]" />
            <h2 className="text-[28px] md:text-3xl text-[#1A1A1A] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('sectionFeatured')}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
            {featuredArticles.map((article, idx) => (
              <motion.div 
                key={article.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="group flex flex-col h-full bg-white p-6 border border-transparent hover:border-[#D4AF37] hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] hover:scale-[1.02] transition-all duration-500"
              >
                <Link href={`/insights/${article.slug}`} className="block overflow-hidden mb-8 relative aspect-[16/9] -mx-6 -mt-6">
                  <ImageWithFallback
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute top-6 left-6 bg-white text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold px-4 py-2 shadow-lg">
                    {article.category}
                  </div>
                </Link>
                
                <div className="flex items-center gap-4 text-[11px] text-gray-400 uppercase tracking-widest mb-4 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#D4AF37]" /> {article.date}</span>
                  <span className="flex items-center gap-1.5"><User size={14} className="text-[#D4AF37]" /> {article.author}</span>
                </div>
                
                <Link href={`/insights/${article.slug}`} className="block mb-4">
                  <h3 className="text-[24px] md:text-[28px] leading-[1.3] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {article.title}
                  </h3>
                </Link>
                
                <p className="text-[#4A4A4A] text-[15px] leading-[1.7] mb-8 font-light line-clamp-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {article.description}
                </p>
                
                <div className="mt-auto">
                  <Link href={`/insights/${article.slug}`} className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-6 py-3 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-[#D4AF37] transition-colors group/btn">
                    {t('readFullArticle')} <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {/* 6. Nghiên cứu & Dữ liệu (Research & Data) */}
      <section className="py-24 bg-[#F8F9FA] border-y border-gray-200 my-10">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#D4AF37] text-[11px] uppercase tracking-[0.2em] font-bold mb-4 block">
              {t('researchEyebrow')}
            </span>
            <h2 className="text-[28px] md:text-[36px] text-[#1A1A1A] leading-[1.2] font-medium mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
              {t('researchTitleLine1')}
              <br />
              {t('researchTitleLine2')}
            </h2>
            <p className="text-[#4A4A4A] text-[15px] font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('researchBody')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: TrendingUp, value: t('stat1Value'), text: t('stat1Text') },
              { icon: Zap, value: t('stat2Value'), text: t('stat2Text') },
              { icon: CheckCircle2, value: t('stat3Value'), text: t('stat3Text') },
            ].map((stat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white p-8 border-t-4 border-transparent hover:border-[#D4AF37] hover:shadow-xl transition-all duration-300 group"
              >
                <stat.icon size={32} className="text-[#D4AF37] mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                <h3 className="text-4xl text-[#1A1A1A] font-medium mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>{stat.value}</h3>
                <p className="text-[#4A4A4A] text-[13px] leading-relaxed font-medium uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {stat.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Tất cả bài viết (All Articles) */}
      <section className="py-20 bg-white">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[#D4AF37]" />
              <h2 className="text-[28px] md:text-3xl text-[#1A1A1A] font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t('sectionLibrary')}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {filtered.length === 0 ? (
              <p className="col-span-full text-center py-12 text-[#4A4A4A] text-[15px]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('emptyList')}
              </p>
            ) : listPosts.length > 0 ? (
              listPosts.map((post) => (
                <BlogCard key={post.id} post={post} readMoreLabel={t('readMoreLink')} />
              ))
            ) : null}
          </div>

          <ListPagination page={currentPage} pageCount={totalGridPages} />
        </div>
      </section>

      {/* 7. Video Webinar Section */}
      <section className="py-24 bg-[#1A1A1A] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-flex items-center gap-2 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em] mb-6 border border-[#D4AF37]/30 px-3 py-1">
                <PlayCircle size={14} /> {t('webinarBadge')}
              </span>
              <h2 className="text-[32px] md:text-[40px] leading-[1.2] font-medium mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
                {t('webinarTitle')}
              </h2>
              <p className="text-white/70 text-[15px] font-light leading-[1.8] mb-8" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {t('webinarBody')}
              </p>
              <div className="flex flex-wrap gap-6 text-[12px] font-medium tracking-wider mb-10 text-white/90">
                <span className="flex items-center gap-2"><Calendar size={16} className="text-[#D4AF37]" /> {t('webinarDurationLabel')} {t('webinarDurationValue')}</span>
                <span className="flex items-center gap-2"><User size={16} className="text-[#D4AF37]" /> {t('webinarSpeakerLabel')} {t('webinarSpeakerValue')}</span>
              </div>
              <button type="button" className="bg-transparent border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#1A1A1A] px-8 py-4 uppercase tracking-[0.15em] text-[12px] font-bold transition-all duration-300">
                {t('webinarCta')}
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
              className="relative aspect-video bg-black cursor-pointer group"
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg"
                alt={t('webinarThumbAlt')}
                className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#D4AF37] text-[#1A1A1A] flex items-center justify-center pl-1 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <PlayCircle size={40} strokeWidth={1.5} fill="currentColor" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Newsletter Section */}
      <section className="py-24 bg-[#1A1A1A] text-white">
        <div className="max-w-[1440px] mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-[32px] md:text-[40px] text-white mb-4 font-medium" style={{ fontFamily: 'Playfair Display, serif' }}>{t('newsletterTitle')}</h2>
            <p className="text-white/60 mb-12 text-[14px] uppercase tracking-widest font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{t('newsletterSubtitle')}</p>
            <form className="flex flex-col gap-4" onSubmit={handleFooterSubscribe}>
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  required
                  name="footerName"
                  value={footerName}
                  onChange={(e) => setFooterName(e.target.value)}
                  placeholder={t('newsletterNamePlaceholder')}
                  className="flex-1 px-8 py-4 bg-[#2A2A2A] border border-white/10 outline-none focus:border-[#D4AF37] text-white text-[14px] transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  disabled={footerLoading}
                />
                <input 
                  type="email" 
                  required
                  name="footerEmail"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  placeholder={t('newsletterEmailPlaceholder')}
                  className="flex-1 px-8 py-4 bg-[#2A2A2A] border border-white/10 outline-none focus:border-[#D4AF37] text-white text-[14px] transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  disabled={footerLoading}
                />
              </div>
              <button
                type="submit"
                disabled={footerLoading}
                className="bg-[#D4AF37] text-[#1A1A1A] w-full px-10 py-5 uppercase tracking-[0.2em] text-[12px] font-bold hover:bg-white transition-all duration-300 disabled:opacity-60"
              >
                {footerOk ? t('signupFooterOk') : footerLoading ? t('signupSending') : t('newsletterSubmit')}
              </button>
            </form>
            <p className="text-white/40 text-[11px] mt-6 font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {t('newsletterLegal')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}