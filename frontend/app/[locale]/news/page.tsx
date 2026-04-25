import { setRequestLocale } from 'next-intl/server';
import { api } from '@/lib/api';
import { toUiNewsListItem, type StrapiNews } from '@/lib/cms-article-news';
import NewsListClient from './news-list-client';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

export default async function NewsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const res = await api.cmsNews(locale).catch(() => ({ data: [] as StrapiNews[] }));
  const raw = (res?.data ?? []) as StrapiNews[];
  const items = raw.map((e) => toUiNewsListItem(e, locale));
  return <NewsListClient items={items} />;
}
