import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api';
import { toUiArticleListItem, type StrapiArticle } from '@/lib/cms-article-news';
import InsightsListClient from './insights-list-client';

type Params = Promise<{ locale: string }>;

export const dynamic = 'force-dynamic';

export default async function InsightsPage({ params }: { params: Params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Insights' });
  const res = await api.cmsArticles(locale).catch(() => ({ data: [] as StrapiArticle[] }));
  const raw = (res?.data ?? []) as StrapiArticle[];
  const authorCredit = t('authorCredit');
  const posts = raw.map((e) => toUiArticleListItem(e, locale, authorCredit));
  return (
    <Suspense fallback={null}>
      <InsightsListClient posts={posts} />
    </Suspense>
  );
}
