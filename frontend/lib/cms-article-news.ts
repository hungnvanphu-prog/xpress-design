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
    author_display_name?: string | null;
    hero_image_url?: string | null;
    lead?: string | null;
    reading_time_minutes?: number | null;
    author_role?: string | null;
    author_bio?: string | null;
    author_avatar?: StrapiMedia;
    content?: unknown;
    publishedAt?: string | null;
    createdAt?: string | null;
    tags?: string[] | null;
    locale?: string;
    seo_title?: string | null;
    seo_description?: string | null;
    thumbnail?: StrapiMedia;
    category?: {
      data?: {
        id?: number;
        attributes?: { name?: string } | null;
      } | null;
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

const AUTHOR_AVATAR_FALLBACK =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80';

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
  const hero = (a.hero_image_url || '').trim();
  return {
    id: entity.id,
    slug: a.slug,
    title: a.title,
    description: (a.excerpt || '').trim() || richtextToHtml(a.content).replace(/<[^>]+>/g, '').slice(0, 200),
    image: hero || pickThumb(a.thumbnail),
    date: formatListDate(published, locale),
    category: a.category?.data?.attributes?.name || '—',
    author: (a.author_display_name || '').trim() || authorLabel,
    localizedSlugs: buildLocalizedSlugs(a.locale, a.slug, a.localizations),
  };
}

export type UiArticleDetail = UiArticleListItem & {
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  categoryId?: number;
  lead?: string;
  readingTimeMinutes?: number;
  authorRole?: string;
  authorBio?: string;
  authorAvatar?: string;
};

function pickDetailImage(entity: StrapiArticle): string {
  const a = entity.attributes;
  const fromUrl = (a.hero_image_url || '').trim();
  if (fromUrl) return fromUrl;
  return pickThumb(a.thumbnail);
}

export function toUiArticleDetail(
  entity: StrapiArticle,
  locale: string,
  authorLabel: string,
): UiArticleDetail {
  const a = entity.attributes;
  const displayAuthor = (a.author_display_name || '').trim() || authorLabel;
  const list = toUiArticleListItem(entity, locale, displayAuthor);
  const catId = a.category?.data?.id;
  return {
    ...list,
    image: pickDetailImage(entity),
    author: displayAuthor,
    contentHtml: richtextToHtml(a.content),
    seoTitle: a.seo_title || undefined,
    seoDescription: a.seo_description || undefined,
    tags: Array.isArray(a.tags) ? a.tags : [],
    categoryId: typeof catId === 'number' ? catId : undefined,
    lead: (a.lead || '').trim() || undefined,
    readingTimeMinutes: a.reading_time_minutes ?? undefined,
    authorRole: (a.author_role || '').trim() || undefined,
    authorBio: (a.author_bio || '').trim() || undefined,
    authorAvatar: (() => {
      const u = pickThumb(a.author_avatar);
      return u === PLACEHOLDER ? AUTHOR_AVATAR_FALLBACK : u;
    })(),
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
