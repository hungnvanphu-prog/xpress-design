"use client";

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import type { UiArticleDetail } from '@/lib/cms-article-news';

const fade = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

export default function ArticleDetailClient({ article }: { article: UiArticleDetail }) {
  const tCommon = useTranslations('Common');
  const tNav = useTranslations('Nav');

  return (
    <div className="bg-[#F8F9FA] text-[#1A1A1A] w-full min-h-screen font-['Montserrat',sans-serif]">
      <section className="relative w-full h-[50vh] md:h-[60vh]">
        <ImageWithFallback
          src={article.image}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute bottom-0 left-0 right-0 max-w-[900px] mx-auto px-6 md:px-12 pb-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className="text-white"
          >
            <motion.p variants={fade} className="text-[#D4AF37] text-[10px] uppercase tracking-[0.25em] font-bold mb-4">
              {article.category}
            </motion.p>
            <motion.h1
              variants={fade}
              className="font-['Playfair_Display',serif] text-[32px] md:text-[48px] leading-[1.15] font-medium"
            >
              {article.title}
            </motion.h1>
            {article.description ? (
              <motion.p variants={fade} className="mt-6 text-white/85 text-[15px] leading-relaxed max-w-2xl font-light">
                {article.description}
              </motion.p>
            ) : null}
            <motion.p variants={fade} className="mt-4 text-white/50 text-[11px] uppercase tracking-widest">
              {article.date} · {article.author}
            </motion.p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[720px] mx-auto px-6 py-10 md:py-16">
        <Link
          href="/insights"
          className="inline-flex items-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#4A4A4A] hover:text-[#D4AF37] transition-colors mb-12"
        >
          <ChevronRight className="rotate-180 mr-2" size={14} /> {tCommon('backToList')} — {tNav('insights')}
        </Link>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose prose-neutral prose-lg max-w-none
            prose-headings:font-['Playfair_Display',serif] prose-p:text-[#4A4A4A] prose-p:leading-[1.85] prose-p:font-light
            prose-a:text-[#B8942E] prose-li:text-[#4A4A4A]"
        >
          {article.contentHtml ? (
            <div dangerouslySetInnerHTML={{ __html: article.contentHtml }} />
          ) : null}
        </motion.article>

        {article.tags.length > 0 ? (
          <div className="mt-16 flex flex-wrap gap-2">
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
      </div>
    </div>
  );
}
