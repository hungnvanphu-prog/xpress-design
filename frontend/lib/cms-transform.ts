/**
 * Adapter giữa dữ liệu Strapi (qua Nest proxy /api/cms/projects) và UI Project.
 * Giúp giữ nguyên UI hiện có trong lúc đổi nguồn dữ liệu sang CMS.
 */

import { cmsMedia } from '@/lib/api';
import type { Project } from '@/data/projects';

// Strapi 4 entity shape với populate: '*'
type StrapiMedia = {
  data?: {
    id?: number;
    attributes?: {
      url?: string;
      alternativeText?: string | null;
      formats?: Record<string, { url?: string }>;
    };
  } | Array<{
    id?: number;
    attributes?: {
      url?: string;
      alternativeText?: string | null;
      formats?: Record<string, { url?: string }>;
    };
  }> | null;
};

export type StrapiProject = {
  id: number;
  attributes: {
    title: string;
    slug: string;
    description?: string | null;
    content?: string | null;
    hero_subtitle?: string | null;
    problem_label?: string | null;
    problem_title?: string | null;
    problem_body?: string | null;
    implementation_label?: string | null;
    implementation_title?: string | null;
    implementation_body?: string | null;
    result_label?: string | null;
    result_quote?: string | null;
    location?: string | null;
    client_name?: string | null;
    project_type?: string | null;
    year?: number | null;
    architect?: string | null;
    area?: string | null;
    construction_time?: number | null;
    featured?: boolean | null;
    seo_title?: string | null;
    seo_description?: string | null;
    locale?: string;
    thumbnail?: StrapiMedia;
    cover_image?: StrapiMedia;
    gallery?: StrapiMedia;
    localizations?: {
      data?: Array<{
        id: number;
        attributes: { slug: string; locale: string };
      }>;
    };
  };
};

// Ảnh fallback (Unsplash) giữ cho UI đẹp khi Strapi chưa upload media thật
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1765279162736-14c7d64ff820?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1761330439180-2bba3bbb8eb2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1758381851526-bdfa3810b4ff?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1758448756362-e323282ccbcc?auto=format&fit=crop&w=1200&q=80',
];

function pickMediaUrl(media?: StrapiMedia): string | null {
  if (!media?.data) return null;
  const node = Array.isArray(media.data) ? media.data[0] : media.data;
  const url = node?.attributes?.url;
  return url ? cmsMedia(url) : null;
}

function pickGalleryUrls(media?: StrapiMedia): string[] {
  if (!media?.data) return [];
  const arr = Array.isArray(media.data) ? media.data : [media.data];
  return arr
    .map((n) => (n?.attributes?.url ? cmsMedia(n.attributes.url) : null))
    .filter((u): u is string => Boolean(u));
}

// project_type (enum Strapi) → Category + Style hiển thị
const TYPE_MAP: Record<string, { category: string; style: string }> = {
  residential: { category: 'Residential', style: 'Modern' },
  commercial: { category: 'Commercial', style: 'Contemporary' },
  public: { category: 'Public', style: 'Civic' },
  interior: { category: 'Interior', style: 'Minimalist' },
  landscape: { category: 'Landscape', style: 'Organic' },
};

/**
 * Chuyển entity Strapi → UI Project (mở rộng thêm slug, content, featured).
 * Dùng index để chọn placeholder khác nhau nếu không có ảnh thật.
 */
export function toUiProject(entity: StrapiProject, index = 0): Project & {
  slug: string;
  content?: string;
  featured?: boolean;
  projectType?: string;
  constructionMonths?: number;
  localizedSlugs?: Record<string, string>;
  heroSubtitle?: string;
  problemLabel?: string;
  problemTitle?: string;
  problemBody?: string;
  implementationLabel?: string;
  implementationTitle?: string;
  implementationBody?: string;
  resultLabel?: string;
  resultQuote?: string;
} {
  const a = entity.attributes;
  const typeMeta = TYPE_MAP[a.project_type || ''] ?? {
    category: a.project_type || 'Project',
    style: '',
  };

  const coverMedia = pickMediaUrl(a.cover_image);
  const thumbMedia = pickMediaUrl(a.thumbnail);
  const mediaGallery = pickGalleryUrls(a.gallery);

  const fallback = PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];

  const cover = coverMedia ?? thumbMedia ?? fallback;

  // Chỉ dùng media upload từ Strapi; placeholder là lớp bảo vệ cuối cùng.
  const gallery =
    mediaGallery.length > 0
      ? mediaGallery
      : [cover, thumbMedia, fallback].filter((u): u is string => Boolean(u));

  const localizedSlugs: Record<string, string> = {};
  if (a.locale) localizedSlugs[a.locale] = a.slug;
  for (const loc of a.localizations?.data ?? []) {
    const locCode = loc.attributes?.locale;
    const locSlug = loc.attributes?.slug;
    if (locCode && locSlug) localizedSlugs[locCode] = locSlug;
  }

  return {
    id: entity.id,
    slug: a.slug,
    title: a.title,
    category: typeMeta.category,
    style: typeMeta.style,
    image: cover,
    description: a.description ?? '',
    content: a.content ?? undefined,
    heroSubtitle: a.hero_subtitle ?? undefined,
    problemLabel: a.problem_label ?? undefined,
    problemTitle: a.problem_title ?? undefined,
    problemBody: a.problem_body ?? undefined,
    implementationLabel: a.implementation_label ?? undefined,
    implementationTitle: a.implementation_title ?? undefined,
    implementationBody: a.implementation_body ?? undefined,
    resultLabel: a.result_label ?? undefined,
    resultQuote: a.result_quote ?? undefined,
    client: a.client_name ?? undefined,
    location: a.location ?? undefined,
    year: a.year != null ? String(a.year) : undefined,
    architect: a.architect ?? undefined,
    area: a.area ?? undefined,
    constructionMonths: a.construction_time ?? undefined,
    featured: a.featured ?? false,
    projectType: a.project_type ?? undefined,
    gallery,
    localizedSlugs,
  };
}

export function toUiProjects(entities: StrapiProject[]): ReturnType<typeof toUiProject>[] {
  return entities.map((e, i) => toUiProject(e, i));
}
