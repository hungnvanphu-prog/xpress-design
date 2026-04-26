import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { api } from '@/lib/api';
import {
  toUiArticleListItem,
  toUiNewsListItem,
  type StrapiArticle,
  type StrapiNews,
} from '@/lib/cms-article-news';
import { localizedPath, buildLanguageAlternates } from '@/lib/metadata';
import TagArchiveClient from './tag-archive-client';

type Params = Promise<{ locale: string; slug: string }>;

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 100;

const TAG_HERO_FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80';

export type TagArchiveCard = {
  key: string;
  kind: 'insight' | 'news';
  href: string;
  typeLabel: string;
  title: string;
  excerpt: string;
  image: string;
  dateDisplay: string;
  metaLine: string;
};

type Sortable = TagArchiveCard & { sortTs: number };

function articleSortTs(a: StrapiArticle): number {
  const iso = a.attributes.publishedAt || a.attributes.createdAt;
  return iso ? new Date(iso).getTime() : 0;
}

function newsSortTs(n: StrapiNews): number {
  const iso = n.attributes.event_date || n.attributes.publishedAt;
  return iso ? new Date(iso).getTime() : 0;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params;
  const tArchive = await getTranslations({ locale, namespace: 'TagArchive' });
  const res = await api.cmsTagBySlug(slug).catch(() => null);
  const raw = res?.data?.[0] as { attributes?: { name?: string; name_en?: string | null } } | undefined;
  if (!raw?.attributes) {
    return { title: tArchive('notFoundTitle') };
  }
  const attrs = raw.attributes;
  const name =
    locale === 'en'
      ? (attrs.name_en || '').trim() || (attrs.name || '').trim()
      : (attrs.name || '').trim();
  const path = `/tags/${slug}`;
  const title = tArchive('metaTitle', { tag: name });
  const description = tArchive('metaDescription', { tag: name });

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(path, locale),
      languages: buildLanguageAlternates(path),
    },
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function TagArchivePage({ params }: { params: Params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const tagRes = await api.cmsTagBySlug(slug).catch(() => null);
  const tagEntity = tagRes?.data?.[0] as
    | { attributes: { name?: string; name_en?: string | null; slug?: string } }
    | undefined;
  if (!tagEntity?.attributes) notFound();

  const tagSlugNorm = slug.trim().toLowerCase();
  const [articlesRes, newsRes] = await Promise.all([
    api.cmsArticles(locale, { tagSlug: tagSlugNorm, page: 1, pageSize: PAGE_SIZE }).catch(() => ({
      data: [] as StrapiArticle[],
    })),
    api.cmsNews(locale, { tagSlug: tagSlugNorm, page: 1, pageSize: PAGE_SIZE }).catch(() => ({
      data: [] as StrapiNews[],
    })),
  ]);

  const articles = (articlesRes?.data ?? []) as StrapiArticle[];
  const newsItems = (newsRes?.data ?? []) as StrapiNews[];

  const tInsights = await getTranslations({ locale, namespace: 'Insights' });
  const tArchive = await getTranslations({ locale, namespace: 'TagArchive' });
  const authorCredit = tInsights('authorCredit');

  const attrs = tagEntity.attributes;
  const tagDisplayName =
    locale === 'en'
      ? (attrs.name_en || '').trim() || (attrs.name || '').trim()
      : (attrs.name || '').trim();

  const merged: Sortable[] = [];

  for (const a of articles) {
    const ui = toUiArticleListItem(a, locale, authorCredit);
    merged.push({
      key: `a-${a.id}`,
      kind: 'insight',
      href: `/insights/${ui.slug}`,
      typeLabel: tArchive('typeInsight'),
      title: ui.title,
      excerpt: ui.description,
      image: ui.image,
      dateDisplay: ui.date,
      metaLine: ui.author,
      sortTs: articleSortTs(a),
    });
  }

  for (const n of newsItems) {
    const ui = toUiNewsListItem(n, locale);
    const source = (n.attributes.source || '').trim();
    const dateLine = [ui.day, ui.monthYear].filter(Boolean).join(' ');
    merged.push({
      key: `n-${n.id}`,
      kind: 'news',
      href: `/news/${ui.slug}`,
      typeLabel: tArchive('typeNews'),
      title: ui.title,
      excerpt: ui.summary,
      image: ui.image,
      dateDisplay: dateLine || '—',
      metaLine: source || '—',
      sortTs: newsSortTs(n),
    });
  }

  merged.sort((x, y) => y.sortTs - x.sortTs);
  const cards: TagArchiveCard[] = merged.map((row) => {
    const { sortTs, ...card } = row;
    void sortTs;
    return card;
  });

  const heroImage =
    (cards[0]?.image && String(cards[0].image).trim()) || TAG_HERO_FALLBACK_IMAGE;

  return <TagArchiveClient tagName={tagDisplayName} cards={cards} heroImage={heroImage} />;
}
