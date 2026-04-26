'use client';

import { Link } from '@/i18n/navigation';
import type { ArticleTag } from '@/lib/cms-article-news';

/**
 * Link tag tới trang archive /tags/[slug] (gộp Góc nhìn + Tin tức).
 */
export function ContentTagLinks({ tags, label }: { tags: ArticleTag[]; label?: string }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 gap-y-2">
      {label ? (
        <span className="text-[10px] uppercase tracking-[0.2em] text-[#888888] font-semibold font-['Montserrat',sans-serif] w-full sm:w-auto sm:mr-1">
          {label}
        </span>
      ) : null}
      {tags.map((tag) => (
        <Link
          key={`${tag.slug}-${tag.id ?? tag.name}`}
          href={`/tags/${encodeURIComponent(tag.slug)}`}
          className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] px-4 py-2 border border-[#1A1A1A]/12 bg-[#F8F9FA] text-[#4A4A4A] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-colors font-['Montserrat',sans-serif]"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
