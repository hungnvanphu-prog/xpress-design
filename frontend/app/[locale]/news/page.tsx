import { setRequestLocale } from 'next-intl/server';
import { api, readCmsPagination } from '@/lib/api';
import { toUiNewsListItem, type StrapiNews } from '@/lib/cms-article-news';
import NewsListClient from './news-list-client';

type Params = Promise<{ locale: string }>;
type SearchParams = Promise<{ page?: string; tag?: string }>;

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 8;

export default async function NewsPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1);
  const tagSlug = (sp.tag || '').trim().toLowerCase() || undefined;

  const res = await api.cmsNews(locale, { page, pageSize: PAGE_SIZE, tagSlug }).catch(() => ({
    data: [] as StrapiNews[],
    meta: {},
  }));
  const raw = (res?.data ?? []) as StrapiNews[];
  const items = raw.map((e) => toUiNewsListItem(e, locale));
  const pagination = readCmsPagination(res?.meta);

  return <NewsListClient items={items} pagination={pagination} activeTagSlug={tagSlug} />;
}
