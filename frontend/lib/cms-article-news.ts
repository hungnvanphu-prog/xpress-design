/**
 * Strapi → UI cho Article (Góc nhìn) và News.
 */

import { cmsMedia } from '@/lib/api';

type StrapiMedia = {
  data?: {
    id?: number;
    attributes?: { url?: string; alternativeText?: string | null };
  } | null;
};

export type StrapiArticle = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    excerpt?: string | null;
    content?: unknown;
    publishedAt?: string | null;
    createdAt?: string | null;
    tags?: string[] | null;
    locale?: string;
    seo_title?: string | null;
    seo_description?: string | null;
    thumbnail?: StrapiMedia;
    category?: {
      data?: { attributes?: { name?: string } | null } | null;
    } | null;
    localizations?: {
      data?: Array<{
        id: number;
        attributes: { slug: string; locale: string };
      }>;
    };
  };
};

export type StrapiNews = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content?: unknown;
    event_date?: string | null;
    type?: 'news' | 'event' | 'community' | null;
    location?: string | null;
    locale?: string;
    thumbnail?: StrapiMedia;
    localizations?: {
      data?: Array<{
        id: number;
        attributes: { slug: string; locale: string };
      }>;
    };
  };
};

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';

function pickThumb(media?: StrapiMedia | null): string {
  if (!media?.data) return PLACEHOLDER;
  const m = media.data;
  const node = Array.isArray(m) ? m[0] : m;
  const url = node?.attributes?.url;
  return url ? cmsMedia(url) ?? PLACEHOLDER : PLACEHOLDER;
}

/** Strapi 4 richtext thường là chuỗi; hỗ trợ tối thiểu blocks nếu có. */
export function richtextToHtml(content: unknown): string {
  if (content == null) return '';
  if (typeof content === 'string') {
    const t = content.trim();
    if (!t) return '';
    if (t.startsWith('<')) return content;
    return `<p>${t.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
  }
  if (Array.isArray(content)) {
    return content
      .map((b) => {
        if (b?.type === 'paragraph' && Array.isArray(b.children)) {
          const text = b.children
            .map((c: { type?: string; text?: string }) => (c.type === 'text' && c.text ? c.text : ''))
            .join('');
          return text ? `<p>${text}</p>` : '';
        }
        return '';
      })
      .join('');
  }
  return '';
}

function buildLocalizedSlugs(
  locale: string | undefined,
  slug: string,
  localizations?: StrapiArticle['attributes']['localizations'] | StrapiNews['attributes']['localizations'],
): Record<string, string> {
  const map: Record<string, string> = {};
  if (locale) map[locale] = slug;
  for (const loc of localizations?.data ?? []) {
    const c = loc.attributes?.locale;
    const s = loc.attributes?.slug;
    if (c && s) map[c] = s;
  }
  return map;
}

function formatListDate(iso: string | undefined, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export type UiArticleListItem = {
  id: number;
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  category: string;
  author: string;
  localizedSlugs: Record<string, string>;
};

export function toUiArticleListItem(entity: StrapiArticle, locale: string, authorLabel: string): UiArticleListItem {
  const a = entity.attributes;
  const published = a.publishedAt || a.createdAt;
  return {
    id: entity.id,
    slug: a.slug,
    title: a.title,
    description: (a.excerpt || '').trim() || richtextToHtml(a.content).replace(/<[^>]+>/g, '').slice(0, 200),
    image: pickThumb(a.thumbnail),
    date: formatListDate(published, locale),
    category: a.category?.data?.attributes?.name || '—',
    author: authorLabel,
    localizedSlugs: buildLocalizedSlugs(a.locale, a.slug, a.localizations),
  };
}

export type UiArticleDetail = UiArticleListItem & {
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
};

export function toUiArticleDetail(
  entity: StrapiArticle,
  locale: string,
  authorLabel: string,
): UiArticleDetail {
  const list = toUiArticleListItem(entity, locale, authorLabel);
  const a = entity.attributes;
  return {
    ...list,
    contentHtml: richtextToHtml(a.content),
    seoTitle: a.seo_title || undefined,
    seoDescription: a.seo_description || undefined,
    tags: Array.isArray(a.tags) ? a.tags : [],
  };
}

export type UiNewsListItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  image: string;
  day: string;
  monthYear: string;
  categoryKey: 'news' | 'event' | 'community';
  location?: string;
  localizedSlugs: Record<string, string>;
};

function formatNewsTimeline(iso: string | undefined, locale: string): { day: string; monthYear: string } {
  if (!iso) return { day: '—', monthYear: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { day: '—', monthYear: '' };
  const day = String(d.getDate()).padStart(2, '0');
  if (locale === 'en') {
    const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(d);
    return { day, monthYear };
  }
  const monthYear = new Intl.DateTimeFormat('vi-VN', { month: 'short', year: 'numeric' }).format(d);
  return { day, monthYear };
}

export function toUiNewsListItem(entity: StrapiNews, locale: string): UiNewsListItem {
  const a = entity.attributes;
  const t = a.type || 'news';
  const typeKey = t === 'event' || t === 'community' ? t : 'news';
  const bodyText = richtextToHtml(a.content).replace(/<[^>]+>/g, '').trim();
  const { day, monthYear } = formatNewsTimeline(a.event_date || undefined, locale);
  return {
    id: entity.id,
    slug: a.slug,
    title: a.title,
    summary: bodyText.slice(0, 280) + (bodyText.length > 280 ? '…' : ''),
    image: pickThumb(a.thumbnail),
    day,
    monthYear,
    categoryKey: typeKey,
    location: a.location || undefined,
    localizedSlugs: buildLocalizedSlugs(a.locale, a.slug, a.localizations),
  };
}

export type UiNewsDetail = UiNewsListItem & {
  contentHtml: string;
  eventDateIso: string | null;
};

export function toUiNewsDetail(entity: StrapiNews, locale: string): UiNewsDetail {
  const list = toUiNewsListItem(entity, locale);
  const a = entity.attributes;
  return {
    ...list,
    contentHtml: richtextToHtml(a.content),
    eventDateIso: a.event_date || null,
  };
}
