/**
 * API helpers: NestJS backend + Strapi CMS.
 *
 * - Gọi trên server (RSC / server actions): dùng INTERNAL_* (docker network)
 * - Gọi trên client (browser): dùng NEXT_PUBLIC_* (localhost / nginx)
 */

const isServer = typeof window === 'undefined';

export const API_URL = isServer
  ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const CMS_URL = isServer
  ? process.env.INTERNAL_CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337'
  : process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';

type FetchOptions = RequestInit & { revalidate?: number };

export type CmsPaginationOpts = {
  page?: number;
  pageSize?: number;
};

export type CmsArticlesQueryOpts = CmsPaginationOpts & {
  categoryId?: number;
  excludeSlug?: string;
  /** Lọc Góc nhìn theo slug tag */
  tagSlug?: string;
};

export type CmsNewsQueryOpts = CmsPaginationOpts & {
  /** Lọc tin có tag (slug Strapi) */
  tagSlug?: string;
};

function appendStrapiPagination(q: URLSearchParams, opts?: CmsPaginationOpts) {
  if (opts?.page != null) q.set('pagination[page]', String(Math.max(1, opts.page)));
  if (opts?.pageSize != null) q.set('pagination[pageSize]', String(Math.max(1, opts.pageSize)));
}

export function readCmsPagination(meta: unknown): {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
} {
  const m = meta as { pagination?: Record<string, number> } | undefined;
  const p = m?.pagination;
  const pageCount = Math.max(1, Number(p?.pageCount) || 1);
  return {
    page: Math.max(1, Number(p?.page) || 1),
    pageSize: Math.max(1, Number(p?.pageSize) || 25),
    pageCount,
    total: Math.max(0, Number(p?.total) || 0),
  };
}

async function request<T>(base: string, path: string, opts: FetchOptions = {}): Promise<T> {
  const { revalidate, ...rest } = opts;
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(rest.headers || {}),
    },
    next: revalidate !== undefined ? { revalidate } : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${base}${path}: ${text}`);
  }
  return res.json();
}

// ==================== NestJS (backend) ====================

export const api = {
  // Auth
  register: (data: { email: string; password: string; name?: string }) =>
    request(API_URL, '/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request(API_URL, '/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  me: (token: string) =>
    request(API_URL, '/auth/me', { headers: { Authorization: `Bearer ${token}` } }),

  // Contact
  sendContact: (data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }) => request(API_URL, '/contact', { method: 'POST', body: JSON.stringify(data) }),

  // Newsletter
  subscribe: (email: string) =>
    request(API_URL, '/newsletter', { method: 'POST', body: JSON.stringify({ email }) }),

  // CMS proxy qua Nest (bảo mật hơn gọi thẳng Strapi từ FE)
  cmsProjects: (locale?: string, opts?: CmsPaginationOpts & { category?: string }) => {
    const q = new URLSearchParams();
    if (locale) q.set('locale', locale);
    q.set('populate', '*');
    q.set('sort', 'publishedAt:desc');
    appendStrapiPagination(q, opts);
    if (opts?.category && opts.category !== 'all') {
      q.set('filters[project_type][$eq]', opts.category);
    }
    return request<{ data: any[]; meta?: any }>(API_URL, `/cms/projects?${q}`, { revalidate: 60 });
  },

  cmsProjectBySlug: (slug: string, locale?: string) =>
    request<{ data: any[]; meta?: any }>(
      API_URL,
      `/cms/projects/${encodeURIComponent(slug)}${
        locale ? `?locale=${encodeURIComponent(locale)}` : ''
      }`,
      { revalidate: 60 },
    ),

  cmsArticles: (locale?: string, opts?: CmsArticlesQueryOpts) => {
    const q = new URLSearchParams();
    q.set('populate', '*');
    q.set('sort', 'publishedAt:desc');
    if (locale) q.set('locale', locale);
    if (opts?.categoryId != null) {
      q.set('filters[category][id][$eq]', String(opts.categoryId));
    }
    if (opts?.excludeSlug) {
      q.set('filters[slug][$ne]', opts.excludeSlug);
    }
    const artTag = opts?.tagSlug?.trim().toLowerCase();
    if (artTag) q.set('filters[tags][slug][$eq]', artTag);
    appendStrapiPagination(q, opts);
    return request<{ data: any[]; meta?: any }>(API_URL, `/cms/articles?${q}`, { revalidate: 60 });
  },

  cmsArticleBySlug: (slug: string, locale?: string) => {
    const q = new URLSearchParams();
    if (locale) q.set('locale', locale);
    const suffix = q.toString() ? `?${q}` : '';
    return request<{ data: any[]; meta?: any }>(
      API_URL,
      `/cms/articles/${encodeURIComponent(slug)}${suffix}`,
      { revalidate: 60 },
    );
  },

  cmsNews: (locale?: string, opts?: CmsNewsQueryOpts) => {
    const q = new URLSearchParams();
    q.set('populate', '*');
    q.set('sort', 'event_date:desc');
    if (locale) q.set('locale', locale);
    const tag = opts?.tagSlug?.trim().toLowerCase();
    if (tag) q.set('filters[tags][slug][$eq]', tag);
    appendStrapiPagination(q, opts);
    return request<{ data: any[]; meta?: any }>(API_URL, `/cms/news?${q}`, { revalidate: 60 });
  },

  cmsNewsBySlug: (slug: string, locale?: string) => {
    const q = new URLSearchParams();
    q.set('populate', '*');
    if (locale) q.set('locale', locale);
    const suffix = q.toString() ? `?${q}` : '';
    return request<{ data: any[]; meta?: any }>(
      API_URL,
      `/cms/news/${encodeURIComponent(slug)}${suffix}`,
      { revalidate: 60 },
    );
  },

  /** Một tag theo slug (Strapi `api::tag.tag`) */
  cmsTagBySlug: (slug: string) => {
    const q = new URLSearchParams();
    q.set('filters[slug][$eq]', slug.trim().toLowerCase());
    q.set('pagination[pageSize]', '1');
    return request<{ data: any[]; meta?: any }>(API_URL, `/cms/tags?${q}`, { revalidate: 120 });
  },
};

// ==================== Strapi (CMS) ====================

/**
 * Ghép query string với locale (Strapi i18n).
 * - Nếu locale = 'all' → trả tất cả bản dịch (hữu ích cho SSG khi build hreflang)
 * - Mặc định bỏ qua locale nếu không truyền
 */
function withLocale(query: string, locale?: string): string {
  if (!locale) return query;
  const sep = query.includes('?') ? '&' : '?';
  return `${query}${sep}locale=${encodeURIComponent(locale)}`;
}

export const cms = {
  projects: (locale?: string, query = '?populate=*') =>
    request<{ data: any[]; meta: any }>(CMS_URL, `/api/projects${withLocale(query, locale)}`, { revalidate: 60 }),

  projectBySlug: (slug: string, locale?: string) =>
    request<{ data: any[] }>(
      CMS_URL,
      withLocale(`/api/projects?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`, locale),
      { revalidate: 60 },
    ),

  articles: (locale?: string, query = '?populate=*') =>
    request<{ data: any[]; meta: any }>(CMS_URL, `/api/articles${withLocale(query, locale)}`, { revalidate: 60 }),

  articleBySlug: (slug: string, locale?: string) =>
    request<{ data: any[] }>(
      CMS_URL,
      withLocale(`/api/articles?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`, locale),
      { revalidate: 60 },
    ),

  news: (locale?: string, query = '?populate=*&sort=event_date:desc') =>
    request<{ data: any[]; meta: any }>(CMS_URL, `/api/news-items${withLocale(query, locale)}`, { revalidate: 60 }),

  pageBySlug: (slug: string, locale?: string) =>
    request<{ data: any[] }>(
      CMS_URL,
      withLocale(`/api/pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[sections][populate]=*`, locale),
      { revalidate: 60 },
    ),
};

/**
 * Build absolute URL cho media từ Strapi.
 * Strapi trả về url dạng "/uploads/xxx.jpg" → ghép với CMS_URL.
 */
export function cmsMedia(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  // Dùng public CMS URL vì <img>/lightbox render ở browser.
  // ImageWithFallback sẽ tắt Next optimizer cho /uploads để tránh container
  // frontend tự fetch `localhost:1337`.
  const base = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
  return `${base}${url}`;
}
