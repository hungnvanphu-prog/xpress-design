"use client";

import { motion } from "motion/react";
import { ArrowRight, MapPin, X } from "lucide-react";
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/PageHero';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiNewsListItem } from '@/lib/cms-article-news';
import ListPagination from '@/components/ListPagination';

type NewsTypeKey = 'news' | 'event' | 'community';

const typeTKey: Record<NewsTypeKey, 'typeNews' | 'typeEvent' | 'typeCommunity'> = {
  news: 'typeNews',
  event: 'typeEvent',
  community: 'typeCommunity',
};

export default function NewsListClient({
  items,
  pagination,
  activeTagSlug,
}: {
  items: UiNewsListItem[];
  pagination: { page: number; pageSize: number; pageCount: number; total: number };
  activeTagSlug?: string;
}) {
  const tNav = useTranslations('Nav');
  const tPage = useTranslations('PageTitles');
  const tTag = useTranslations('HeroTaglines');
  const tNews = useTranslations('News');
  const tCommon = useTranslations('Common');
  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } }
  };

  const activeTagName = activeTagSlug
    ? items.flatMap((i) => i.tags).find((t) => t.slug === activeTagSlug)?.name ?? activeTagSlug
    : '';

  return (
    <div className="w-full relative bg-[#F8F9FA] min-h-screen">

      <PageHero
        image="https://images.unsplash.com/photo-1648775933902-f633de370964?auto=format&fit=crop&w=1920&q=80"
        title={tPage('news')}
        breadcrumb={tNav('news')}
        homeLabel={tNav('home')}
        tagline={tTag('news')}
        alt="News hero"
      />

      <section className="py-16 md:py-32 px-6 md:px-12 max-w-[1200px] mx-auto relative">
        {activeTagSlug ? (
          <div className="mb-10 flex flex-wrap items-center gap-3 text-[13px] text-[#4A4A4A]">
            <span>
              {tNews('filterByTag')}: <strong className="text-[#1A1A1A]">{activeTagName}</strong>
            </span>
            <Link
              href="/news"
              className="inline-flex items-center gap-1 px-3 py-1.5 border border-[#1A1A1A]/15 text-[11px] font-semibold uppercase tracking-wider hover:border-[#D4AF37] transition-colors"
            >
              <X size={14} /> {tNews('clearTagFilter')}
            </Link>
          </div>
        ) : null}
        {items.length === 0 ? (
          <p className="text-center text-[#4A4A4A] text-[15px] py-12">{tNews('emptyList')}</p>
        ) : (
        <div className="flex flex-col gap-16 md:gap-24">
          <div className="hidden md:block absolute left-[150px] lg:left-[224px] top-32 bottom-32 w-px bg-gray-200 -z-10" />

          {items.map((item, index) => {
            const typeKey = typeTKey[item.categoryKey] ?? 'typeNews';
            return (
            <Link key={item.id} href={`/news/${item.slug}`} className="block">
            <motion.article
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-20 items-start group cursor-pointer"
            >
              <div className="flex-shrink-0 w-auto md:w-24 lg:w-32 flex flex-row md:flex-col items-baseline md:items-end gap-2 md:gap-1 text-left md:text-right relative">
                <div className="hidden md:block absolute right-[-24px] lg:right-[-40px] top-6 w-3 h-3 bg-[#D4AF37] rounded-full ring-4 ring-white transition-transform duration-300 group-hover:scale-150 group-hover:bg-[#1A1A1A]" />
                <span className="font-['Playfair_Display',serif] text-4xl md:text-5xl text-[#D4AF37] font-medium group-hover:text-[#1A1A1A] transition-colors">
                  {item.day}
                </span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">
                  {item.monthYear}
                </span>
              </div>

              <div className="w-full md:w-1/3 lg:w-1/4 aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0 relative">
                <ImageWithFallback
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                  {tNews(typeKey)}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center pt-2 md:pt-4">
                <h2 className="font-['Playfair_Display',serif] text-2xl md:text-3xl text-[#1A1A1A] mb-4 group-hover:text-[#D4AF37] transition-colors line-clamp-2 md:line-clamp-none font-medium">
                  {item.title}
                </h2>
                {item.location ? (
                  <p className="flex items-center gap-1.5 text-[12px] text-gray-500 mb-2">
                    <MapPin size={14} className="text-[#D4AF37] shrink-0" /> {item.location}
                  </p>
                ) : null}
                <p className="text-[#4A4A4A] text-[15px] leading-relaxed mb-6 font-light">
                  {item.summary}
                </p>
                {item.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {item.tags.slice(0, 5).map((tag) => (
                      <Link
                        key={tag.slug}
                        href={`/news?tag=${encodeURIComponent(tag.slug)}`}
                        className="text-[9px] uppercase tracking-wider text-[#888888] hover:text-[#D4AF37] px-2 py-0.5 border border-[#1A1A1A]/10 hover:border-[#D4AF37]/50 bg-[#F8F9FA]/80 transition-colors font-['Montserrat',sans-serif]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                ) : null}
                <div className="mt-auto">
                  <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.1em] text-[#1A1A1A] group-hover:text-[#D4AF37] transition-colors pb-1 border-b border-transparent group-hover:border-[#D4AF37]">
                    {tCommon('readMore')} <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </motion.article>
            </Link>
            );
          })}
        </div>
        )}
        <ListPagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          extraParams={activeTagSlug ? { tag: activeTagSlug } : {}}
        />
      </section>

    </div>
  );
}
