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

  getProjectBySlug(slug: string) {
    return this.proxyGet('/projects', {
      'filters[slug][$eq]': slug,
      populate: '*',
    });
  }

  getArticles(query: Record<string, any>) {
    return this.proxyGet('/articles', { populate: '*', ...query });
  }

  getArticleBySlug(slug: string) {
    return this.proxyGet('/articles', {
      'filters[slug][$eq]': slug,
      populate: '*',
    });
  }

  getNews(query: Record<string, any>) {
    return this.proxyGet('/news', { populate: '*', ...query });
  }

  getPageBySlug(slug: string) {
    return this.proxyGet('/pages', {
      'filters[slug][$eq]': slug,
      populate: 'deep',
    });
  }
}
