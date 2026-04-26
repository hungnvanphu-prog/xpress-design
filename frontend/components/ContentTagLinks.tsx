'use client';

import { Link } from '@/i18n/navigation';
import type { ArticleTag } from '@/lib/cms-article-news';

/**
 * Link tag tới danh sách (insights hoặc news) với ?tag=slug
 */
export function ContentTagLinks({
  tags,
  label,
  listHrefBase,
}: {
  tags: ArticleTag[];
  label?: string;
  /** Đường dẫn danh sách không locale prefix, ví dụ `/insights` hoặc `/news` */
  listHrefBase: string;
}) {
  if (!tags.length) return null;
  const base = listHrefBase.replace(/\/$/, '');
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
          href={`${base}?tag=${encodeURIComponent(tag.slug)}`}
          className="inline-flex items-center text-[10px] uppercase tracking-[0.14em] px-4 py-2 border border-[#1A1A1A]/12 bg-[#F8F9FA] text-[#4A4A4A] hover:border-[#D4AF37] hover:text-[#1A1A1A] transition-colors font-['Montserrat',sans-serif]"
        >
          {tag.name}
        </Link>
      ))}
    </div>
  );
}
