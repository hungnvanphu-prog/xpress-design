import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api';
import { getCmsArticleBySlugResponse } from '@/lib/cms-rsc-cache';
import {
  toUiArticleDetail,
  toUiArticleListItem,
  type StrapiArticle,
  type UiArticleListItem,
} from '@/lib/cms-article-news';
import { routing } from '@/i18n/routing';
import { localizedPath } from '@/lib/metadata';
import ArticleDetailClient from './article-detail-client';
import { LocalizedRouteSetter } from '@/lib/localized-route';

type Params = Promise<{ locale: string; slug: string }>;

export const dynamic = 'force-dynamic';

/** Một lần / request: metadata + page dùng chung bài + i18n (tránh 2× fetch + 2× map). */
const loadUiArticle = cache(async (locale: string, slug: string) => {
  const [t, res] = await Promise.all([
    getTranslations({ locale, namespace: 'Insights' }),
    getCmsArticleBySlugResponse(slug, locale),
  ]);
  const credit = t('authorCredit');
  const entity = res?.data?.[0] as StrapiArticle | undefined;
  return {
    t,
    article: entity ? toUiArticleDetail(entity, locale, credit) : null,
  };
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const { article } = await loadUiArticle(locale, slug);
  if (!article) return { title: 'Not found' };

  const path = `/insights/${slug}`;
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    const lSlug = article.localizedSlugs?.[l] ?? slug;
    languages[l] = localizedPath(`/insights/${lSlug}`, l);
  }
  const defSlug = article.localizedSlugs?.[routing.defaultLocale] ?? slug;
  languages['x-default'] = localizedPath(`/insights/${defSlug}`, routing.defaultLocale);

  const description = (article.seoDescription || article.description || '').slice(0, 160);
  const title = article.seoTitle || article.title;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages,
    },
    openGraph: {
      title,
      description,
      images: article.image ? [article.image] : [],
      type: 'article',
    },
  };
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const { t, article } = await loadUiArticle(locale, slug);
  if (!article) notFound();

  let relatedPosts: UiArticleListItem[] = [];
  if (article.categoryId != null) {
    const rel = await api
      .cmsArticles(locale, {
        page: 1,
        pageSize: 4,
        categoryId: article.categoryId,
        excludeSlug: article.slug,
      })
      .catch(() => ({ data: [] as StrapiArticle[] }));
    const authorCredit = t('authorCredit');
    relatedPosts = ((rel?.data ?? []) as StrapiArticle[])
      .map((e) => toUiArticleListItem(e, locale, authorCredit))
      .slice(0, 3);
  }

  return (
    <>
      <LocalizedRouteSetter basePath="/insights" slugs={article.localizedSlugs ?? {}} />
      <ArticleDetailClient article={article} relatedPosts={relatedPosts} />
    </>
  );
}
