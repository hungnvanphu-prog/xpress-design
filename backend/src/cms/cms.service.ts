import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CmsService {
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl =
      this.config.get<string>('STRAPI_URL') || 'http://cms:1337';
    this.token = this.config.get<string>('STRAPI_TOKEN');
  }

  private async proxyGet(path: string, params?: Record<string, any>) {
    try {
      const res = await firstValueFrom(
        this.http.get(`${this.baseUrl}/api${path}`, {
          params,
          headers: this.token
            ? { Authorization: `Bearer ${this.token}` }
            : undefined,
        }),
      );
      return res.data;
    } catch (err: any) {
      const status = err?.response?.status || 500;
      const data = err?.response?.data || { error: 'CMS proxy error' };
      throw new HttpException(data, status);
    }
  }

  getProjects(query: Record<string, any>) {
    return this.proxyGet('/projects', { populate: '*', ...query });
  }

  getProjectBySlug(slug: string, query: Record<string, any> = {}) {
    return this.proxyGet('/projects', {
      'filters[slug][$eq]': slug,
      populate: '*',
      ...query,
    });
  }

  getArticles(query: Record<string, any>) {
    return this.proxyGet('/articles', { populate: '*', ...query });
  }

  /**
   * Strapi đôi khi không trả `tags` đã populate (axios/qs) hoặc chỉ bản locale khác có quan hệ M2M.
   * Nếu thiếu tag hợp lệ → gọi lại /tags lọc theo article id (và id bản localized).
   */
  async getArticleBySlug(slug: string, query: Record<string, any> = {}) {
    const body = await this.proxyGet('/articles', {
      ...query,
      'filters[slug][$eq]': slug,
      'populate[tags]': '*',
      'populate[category]': '*',
      'populate[thumbnail]': '*',
      'populate[author_avatar]': '*',
      'populate[localizations]': '*',
    });
    return this.enrichArticleTags(body, slug, query);
  }

  /** Strapi pluralName = `news-items` (collection news) */
  getNews(query: Record<string, any>) {
    return this.proxyGet('/news-items', { populate: '*', ...query });
  }

  async getNewsBySlug(slug: string, query: Record<string, any> = {}) {
    const body = await this.proxyGet('/news-items', {
      ...query,
      'filters[slug][$eq]': slug,
      'populate[tags]': '*',
      'populate[thumbnail]': '*',
      'populate[localizations]': '*',
    });
    return this.enrichNewsTags(body, slug);
  }

  getPageBySlug(slug: string) {
    return this.proxyGet('/pages', {
      'filters[slug][$eq]': slug,
      populate: 'deep',
    });
  }

  /** Strapi pluralName = `tags` */
  getTags(query: Record<string, any>) {
    return this.proxyGet('/tags', { ...query });
  }

  private tagRelationEntries(tags: unknown): unknown[] {
    if (tags == null || typeof tags !== 'object') return [];
    const d = (tags as { data?: unknown }).data;
    if (d == null) return [];
    if (Array.isArray(d)) return d;
    if (typeof d === 'object') return [d];
    return [];
  }

  private hasUsableTags(tags: unknown): boolean {
    const entries = this.tagRelationEntries(tags);
    if (entries.length === 0) return false;
    return entries.some((t) => {
      if (t == null || typeof t !== 'object') return false;
      const rec = t as Record<string, unknown>;
      const attr = (rec.attributes as Record<string, unknown>) || {};
      const name = typeof attr.name === 'string' ? attr.name.trim() : '';
      const slug = typeof attr.slug === 'string' ? attr.slug.trim() : '';
      return name.length > 0 || slug.length > 0;
    });
  }

  private collectLocalizationIds(attrs: Record<string, any>): number[] {
    const out: number[] = [];
    const locData = attrs?.localizations?.data;
    if (!Array.isArray(locData)) return out;
    for (const loc of locData) {
      const lid = typeof loc?.id === 'number' ? loc.id : Number(loc?.id);
      if (Number.isFinite(lid) && !out.includes(lid)) out.push(lid);
    }
    return out;
  }

  private async enrichArticleTags(
    body: any,
    slugFallback?: string,
    listQuery: Record<string, any> = {},
  ): Promise<any> {
    const rows = body?.data;
    if (!Array.isArray(rows) || rows.length === 0) return body;
    const article = rows[0];
    const attrs = article.attributes ?? article;
    if (this.hasUsableTags(attrs.tags)) return body;

    const idsToTry: number[] = [];
    const mainId = typeof article.id === 'number' ? article.id : Number(article.id);
    if (Number.isFinite(mainId)) idsToTry.push(mainId);
    for (const lid of this.collectLocalizationIds(attrs)) {
      if (!idsToTry.includes(lid)) idsToTry.push(lid);
    }

    /** Gọi lại /articles chỉ với id + populate tags (tránh lỗi populate khi lọc theo slug). */
    const { populate: _omitPopulate, ...articleListRest } = listQuery;
    for (const aid of idsToTry) {
      try {
        const retry = await this.proxyGet('/articles', {
          ...articleListRest,
          'filters[id][$eq]': aid,
          'populate[tags]': '*',
        });
        const t = retry?.data?.[0]?.attributes?.tags;
        if (this.hasUsableTags(t)) {
          article.attributes = attrs;
          attrs.tags = t;
          return body;
        }
      } catch {
        /* ignore */
      }
    }

    const merged = new Map<number, { id: number; attributes: Record<string, unknown> }>();
    const pullTags = async (params: Record<string, any>) => {
      const tagsBody = await this.proxyGet('/tags', {
        ...params,
        'pagination[pageSize]': 50,
        populate: '*',
      });
      for (const t of tagsBody?.data ?? []) {
        const tid = t?.id;
        const idNum = typeof tid === 'number' ? tid : Number(tid);
        if (!Number.isFinite(idNum)) continue;
        merged.set(idNum, {
          id: idNum,
          attributes: (t.attributes as Record<string, unknown>) || {},
        });
      }
    };

    for (const aid of idsToTry) {
      try {
        await pullTags({ 'filters[articles][id][$eq]': aid });
      } catch {
        /* ignore tag lookup errors */
      }
    }

    if (merged.size === 0) {
      const articleSlug =
        (typeof attrs.slug === 'string' && attrs.slug.trim()) || slugFallback?.trim() || '';
      if (articleSlug) {
        try {
          await pullTags({ 'filters[articles][slug][$eq]': articleSlug });
        } catch {
          /* ignore */
        }
      }
    }

    if (merged.size === 0) return body;
    article.attributes = attrs;
    attrs.tags = { data: [...merged.values()] };
    return body;
  }

  private async enrichNewsTags(body: any, slugFallback?: string): Promise<any> {
    const rows = body?.data;
    if (!Array.isArray(rows) || rows.length === 0) return body;
    const entry = rows[0];
    const attrs = entry.attributes ?? entry;
    if (this.hasUsableTags(attrs.tags)) return body;

    const idsToTry: number[] = [];
    const mainId = typeof entry.id === 'number' ? entry.id : Number(entry.id);
    if (Number.isFinite(mainId)) idsToTry.push(mainId);
    for (const lid of this.collectLocalizationIds(attrs)) {
      if (!idsToTry.includes(lid)) idsToTry.push(lid);
    }

    const merged = new Map<number, { id: number; attributes: Record<string, unknown> }>();
    const pullTags = async (params: Record<string, any>) => {
      const tagsBody = await this.proxyGet('/tags', {
        ...params,
        'pagination[pageSize]': 50,
        populate: '*',
      });
      for (const t of tagsBody?.data ?? []) {
        const tid = t?.id;
        const idNum = typeof tid === 'number' ? tid : Number(tid);
        if (!Number.isFinite(idNum)) continue;
        merged.set(idNum, {
          id: idNum,
          attributes: (t.attributes as Record<string, unknown>) || {},
        });
      }
    };

    for (const nid of idsToTry) {
      try {
        await pullTags({ 'filters[news_items][id][$eq]': nid });
      } catch {
        /* ignore */
      }
    }

    if (merged.size === 0) {
      const newsSlug =
        (typeof attrs.slug === 'string' && attrs.slug.trim()) || slugFallback?.trim() || '';
      if (newsSlug) {
        try {
          await pullTags({ 'filters[news_items][slug][$eq]': newsSlug });
        } catch {
          /* ignore */
        }
      }
    }

    if (merged.size === 0) return body;
    entry.attributes = attrs;
    attrs.tags = { data: [...merged.values()] };
    return body;
  }
}
