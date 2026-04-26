'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Extra = Record<string, string | undefined>;

function buildHref(pathname: string, page: number, extra: Extra, pageParam = 'page'): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    if (v != null && v !== '') q.set(k, v);
  }
  if (page <= 1) q.delete(pageParam);
  else q.set(pageParam, String(page));
  const s = q.toString();
  return s ? `${pathname}?${s}` : pathname;
}

type Props = {
  page: number;
  pageCount: number;
  /** Query params to preserve (e.g. category, search). Omit empty values. */
  extraParams?: Extra;
  pageParam?: string;
};

export default function ListPagination({ page, pageCount, extraParams = {}, pageParam = 'page' }: Props) {
  const pathname = usePathname();
  const t = useTranslations('Common.pagination');

  if (pageCount <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(pageCount, page + 1);
  const cleanExtra = Object.fromEntries(
    Object.entries(extraParams).filter(([, v]) => v != null && v !== ''),
  ) as Extra;

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-4 pt-12 pb-4"
      aria-label={t('ariaLabel')}
    >
      <Link
        href={buildHref(pathname, prev, cleanExtra, pageParam)}
        scroll
        className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-colors ${
          page <= 1
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
        }`}
        aria-disabled={page <= 1}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        {t('prev')}
      </Link>
      <span
        className="text-[13px] text-[#4A4A4A] tabular-nums px-2"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {t('pageOf', { current: page, total: pageCount })}
      </span>
      <Link
        href={buildHref(pathname, next, cleanExtra, pageParam)}
        scroll
        className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] border transition-colors ${
          page >= pageCount
            ? 'pointer-events-none border-gray-200 text-gray-300'
            : 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white'
        }`}
        aria-disabled={page >= pageCount}
      >
        {t('next')}
        <ChevronRight size={16} strokeWidth={1.5} />
      </Link>
    </nav>
  );
}
