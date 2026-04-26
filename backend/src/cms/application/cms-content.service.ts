import { Injectable } from '@nestjs/common';
import { StrapiProxyService } from '../infrastructure/strapi-proxy.service';
import { StrapiEntityTagEnrichmentService } from '../enrichment/strapi-entity-tag-enrichment.service';

/**
 * Use case: đọc nội dung CMS (proxy + tùy chọn bù dữ liệu thiếu từ Strapi).
 */
@Injectable()
export class CmsContentService {
  constructor(
    private readonly strapi: StrapiProxyService,
    private readonly tagEnrichment: StrapiEntityTagEnrichmentService,
  ) {}

  getProjects(query: Record<string, any>) {
    return this.strapi.get('/projects', { populate: '*', ...query });
  }

  getProjectBySlug(slug: string, query: Record<string, any> = {}) {
    return this.strapi.get('/projects', {
      'filters[slug][$eq]': slug,
      populate: '*',
      ...query,
    });
  }

  getArticles(query: Record<string, any>) {
    return this.strapi.get('/articles', { populate: '*', ...query });
  }

  async getArticleBySlug(slug: string, query: Record<string, any> = {}) {
    const body = (await this.strapi.get('/articles', {
      ...query,
      'filters[slug][$eq]': slug,
      'populate[tags]': '*',
      'populate[category]': '*',
      'populate[thumbnail]': '*',
      'populate[author_avatar]': '*',
      'populate[localizations]': '*',
    })) as unknown;
    return this.tagEnrichment.enrichArticleResponse(
      body,
      slug,
      query,
    ) as Promise<unknown>;
  }

  getNews(query: Record<string, any>) {
    return this.strapi.get('/news-items', { populate: '*', ...query });
  }

  async getNewsBySlug(slug: string, query: Record<string, any> = {}) {
    const body = (await this.strapi.get('/news-items', {
      ...query,
      'filters[slug][$eq]': slug,
      'populate[tags]': '*',
      'populate[thumbnail]': '*',
      'populate[localizations]': '*',
    })) as unknown;
    return this.tagEnrichment.enrichNewsResponse(body, slug) as Promise<unknown>;
  }

  getPageBySlug(slug: string) {
    return this.strapi.get('/pages', {
      'filters[slug][$eq]': slug,
      populate: 'deep',
    });
  }

  getTags(query: Record<string, any>) {
    return this.strapi.get('/tags', { ...query });
  }
}
