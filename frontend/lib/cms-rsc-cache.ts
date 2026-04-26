import { cache } from 'react';
import { api } from './api';

/**
 * Request-level deduplication: `generateMetadata` và page cùng request
 * dùng chung kết quả JSON từ Nest/Strapi (tránh 2× HTTP cho cùng resource).
 * Không thay thế cross-request cache; với `dynamic = 'force-dynamic'`, dùng CDN
 * / HTTP cache ở reverse proxy nếu cần thêm.
 */
export const getCmsProjectBySlugResponse = cache((slug: string, locale: string) =>
  api.cmsProjectBySlug(slug, locale).catch(() => null),
);

export const getCmsArticleBySlugResponse = cache((slug: string, locale: string) =>
  api.cmsArticleBySlug(slug, locale).catch(() => null),
);

export const getCmsNewsBySlugResponse = cache((slug: string, locale: string) =>
  api.cmsNewsBySlug(slug, locale).catch(() => null),
);

export const getCmsTagBySlugResponse = cache((slug: string) =>
  api.cmsTagBySlug(slug.trim().toLowerCase()).catch(() => null),
);
