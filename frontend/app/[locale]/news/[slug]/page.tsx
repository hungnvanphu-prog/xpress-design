import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getCmsNewsBySlugResponse } from '@/lib/cms-rsc-cache';
import { toUiNewsDetail, type StrapiNews } from '@/lib/cms-article-news';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/metadata';
import NewsDetailClient from './news-detail-client';
import { LocalizedRouteSetter } from '@/lib/localized-route';

type Params = Promise<{ locale: string; slug: string }>;

export const dynamic = 'force-dynamic';

async function fetchNews(slug: string, locale: string) {
  const res = await getCmsNewsBySlugResponse(slug, locale);
  const entity = res?.data?.[0] as StrapiNews | undefined;
  return entity ? toUiNewsDetail(entity, locale) : null;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await fetchNews(slug, locale);
  if (!item) return { title: 'Not found' };

  const path = `/news/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const lSlug = item.localizedSlugs?.[l] ?? slug;
    languages[l] = localizedPath(`/news/${lSlug}`, l);
  }
  const defSlug = item.localizedSlugs?.[routing.defaultLocale] ?? slug;
  languages['x-default'] = localizedPath(`/news/${defSlug}`, routing.defaultLocale);

  const description = item.summary.slice(0, 160);

  return {
    title: item.title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages,
    },
    openGraph: {
      title: item.title,
      description,
      images: item.image ? [item.image] : [],
      type: 'article',
    },
  };
}

export default async function NewsDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = await fetchNews(slug, locale);
  if (!item) notFound();

  return (
    <>
      <LocalizedRouteSetter basePath="/news" slugs={item.localizedSlugs ?? {}} />
      <NewsDetailClient item={item} />
    </>
  );
}
