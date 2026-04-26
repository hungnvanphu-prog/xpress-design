import { Injectable, Logger } from '@nestjs/common';
import { StrapiProxyService } from '../infrastructure/strapi-proxy.service';
import {
  collectLocalizationIds,
  hasUsableStrapiTags,
} from './strapi-tag-helpers';

type TagMergeMap = Map<
  number,
  { id: number; attributes: Record<string, unknown> }
>;

/**
 * Ứng dụng con: bù tag khi Strapi không populate quan hệ M2M đúng cách.
 */
@Injectable()
export class StrapiEntityTagEnrichmentService {
  private readonly logger = new Logger(StrapiEntityTagEnrichmentService.name);

  constructor(private readonly strapi: StrapiProxyService) {}

  private logEnrichFailure(context: string, err: unknown): void {
    const msg = err instanceof Error ? err.message : String(err);
    this.logger.debug(`Tag enrich (${context}): ${msg}`);
  }

  private async mergeTagsFromIndex(
    strapi: StrapiProxyService,
    merged: TagMergeMap,
    indexParams: Record<string, any>,
  ): Promise<void> {
    const tagsBody = (await strapi.get('/tags', {
      ...indexParams,
      'pagination[pageSize]': 50,
      populate: '*',
    })) as { data?: unknown[] };
    for (const t of tagsBody?.data ?? []) {
      const tid = t && typeof t === 'object' ? (t as { id?: unknown }).id : undefined;
      const idNum = typeof tid === 'number' ? tid : Number(tid);
      if (!Number.isFinite(idNum)) continue;
      merged.set(idNum, {
        id: idNum,
        attributes:
          (t as { attributes?: Record<string, unknown> }).attributes || {},
      });
    }
  }

  /**
   * Strapi đôi khi không trả `tags` đã populate; nếu thiếu tag hợp lệ → bù qua /tags.
   */
  async enrichArticleResponse(
    body: any,
    slugFallback?: string,
    listQuery: Record<string, any> = {},
  ): Promise<any> {
    const rows = body?.data;
    if (!Array.isArray(rows) || rows.length === 0) return body;
    const article = rows[0];
    const attrs = article.attributes ?? article;
    if (hasUsableStrapiTags(attrs.tags)) return body;

    const idsToTry: number[] = [];
    const mainId = typeof article.id === 'number' ? article.id : Number(article.id);
    if (Number.isFinite(mainId)) idsToTry.push(mainId);
    for (const lid of collectLocalizationIds(attrs)) {
      if (!idsToTry.includes(lid)) idsToTry.push(lid);
    }

    const { populate: _omitPopulate, ...articleListRest } = listQuery;
    const idRetries = await Promise.all(
      idsToTry.map((aid) =>
        this.strapi
          .get('/articles', {
            ...articleListRest,
            'filters[id][$eq]': aid,
            'populate[tags]': '*',
          })
          .then((retry) => ({ retry: retry as { data?: { attributes?: { tags?: unknown } }[] } }))
          .catch((e) => {
            this.logEnrichFailure('article id retry', e);
            return { retry: null as { data?: { attributes?: { tags?: unknown } }[] } | null };
          }),
      ),
    );
    for (let i = 0; i < idRetries.length; i++) {
      const t = idRetries[i]?.retry?.data?.[0]?.attributes?.tags;
      if (hasUsableStrapiTags(t)) {
        article.attributes = attrs;
        attrs.tags = t;
        return body;
      }
    }

    const merged: TagMergeMap = new Map();
    const pull = (params: Record<string, any>) =>
      this.mergeTagsFromIndex(this.strapi, merged, params);

    await Promise.all(
      idsToTry.map((aid) =>
        pull({ 'filters[articles][id][$eq]': aid }).catch((e) => {
          this.logEnrichFailure('article tag by id', e);
        }),
      ),
    );

    if (merged.size === 0) {
      const articleSlug =
        (typeof attrs.slug === 'string' && attrs.slug.trim()) ||
        slugFallback?.trim() ||
        '';
      if (articleSlug) {
        try {
          await pull({ 'filters[articles][slug][$eq]': articleSlug });
        } catch (e) {
          this.logEnrichFailure('article tag by slug', e);
        }
      }
    }

    if (merged.size === 0) return body;
    article.attributes = attrs;
    attrs.tags = { data: [...merged.values()] };
    return body;
  }

  /** Strapi pluralName = `news-items` (collection news) */
  async enrichNewsResponse(
    body: any,
    slugFallback?: string,
  ): Promise<any> {
    const rows = body?.data;
    if (!Array.isArray(rows) || rows.length === 0) return body;
    const entry = rows[0];
    const attrs = entry.attributes ?? entry;
    if (hasUsableStrapiTags(attrs.tags)) return body;

    const idsToTry: number[] = [];
    const mainId = typeof entry.id === 'number' ? entry.id : Number(entry.id);
    if (Number.isFinite(mainId)) idsToTry.push(mainId);
    for (const lid of collectLocalizationIds(attrs)) {
      if (!idsToTry.includes(lid)) idsToTry.push(lid);
    }

    const merged: TagMergeMap = new Map();
    const pull = (params: Record<string, any>) =>
      this.mergeTagsFromIndex(this.strapi, merged, params);

    await Promise.all(
      idsToTry.map((nid) =>
        pull({ 'filters[news_items][id][$eq]': nid }).catch((e) => {
          this.logEnrichFailure('news tag by id', e);
        }),
      ),
    );

    if (merged.size === 0) {
      const newsSlug =
        (typeof attrs.slug === 'string' && attrs.slug.trim()) ||
        slugFallback?.trim() ||
        '';
      if (newsSlug) {
        try {
          await pull({ 'filters[news_items][slug][$eq]': newsSlug });
        } catch (e) {
          this.logEnrichFailure('news tag by slug', e);
        }
      }
    }

    if (merged.size === 0) return body;
    entry.attributes = attrs;
    attrs.tags = { data: [...merged.values()] };
    return body;
  }
}
