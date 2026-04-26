'use client';

import type { ReactNode } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/components/ui/utils';

type ExtraQuery = Record<string, string | undefined>;
/** Preserved search params with no empty or undefined values. */
type PreservedQuery = Record<string, string>;

function omitEmptyQueryValues(params: ExtraQuery): PreservedQuery {
  const out: PreservedQuery = {};
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== '') {
      out[key] = value;
    }
  }
  return out;
}

function buildPaginationHref(
  pathname: string,
  page: number,
  extra: PreservedQuery,
  pageParam: string,
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(extra)) {
    q.set(k, v);
  }
  if (page <= 1) {
    q.delete(pageParam);
  } else {
    q.set(pageParam, String(page));
  }
  const search = q.toString();
  return search ? `${pathname}?${search}` : pathname;
}

const controlLinkBase =
  'inline-flex items-center gap-1.5 border px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors';
const controlLinkEnabled = 'border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white';
const controlLinkDisabled = 'pointer-events-none border-gray-200 text-gray-300';

type ControlLinkProps = {
  href: string;
  enabled: boolean;
  children: ReactNode;
};

function ControlLink({ href, enabled, children }: ControlLinkProps) {
  return (
    <Link
      href={href}
      scroll
      className={cn(controlLinkBase, enabled ? controlLinkEnabled : controlLinkDisabled)}
      aria-disabled={!enabled}
    >
      {children}
    </Link>
  );
}

type Props = {
  page: number;
  pageCount: number;
  /** Query params to preserve (e.g. category, search). Omit empty values. */
  extraParams?: ExtraQuery;
  pageParam?: string;
};

export default function ListPagination({ page, pageCount, extraParams = {}, pageParam = 'page' }: Props) {
  const pathname = usePathname();
  const t = useTranslations('Common.pagination');

  if (pageCount <= 1) {
    return null;
  }

  const cleanExtra = omitEmptyQueryValues(extraParams);
  const canGoPrev = page > 1;
  const canGoNext = page < pageCount;
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(pageCount, page + 1);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-4 pt-12 pb-4"
      aria-label={t('ariaLabel')}
    >
      <ControlLink
        href={buildPaginationHref(pathname, prevPage, cleanExtra, pageParam)}
        enabled={canGoPrev}
      >
        <ChevronLeft size={16} strokeWidth={1.5} aria-hidden />
        {t('prev')}
      </ControlLink>
      <span
        className="px-2 text-[13px] tabular-nums text-[#4A4A4A]"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {t('pageOf', { current: page, total: pageCount })}
      </span>
      <ControlLink
        href={buildPaginationHref(pathname, nextPage, cleanExtra, pageParam)}
        enabled={canGoNext}
      >
        {t('next')}
        <ChevronRight size={16} strokeWidth={1.5} aria-hidden />
      </ControlLink>
    </nav>
  );
}
