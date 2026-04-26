import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { isAxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

/**
 * Tầng hạ tầng: chỉ giao tiếp HTTP với Strapi, không có quy tắc nghiệp vụ.
 */
@Injectable()
export class StrapiProxyService {
  private readonly logger = new Logger(StrapiProxyService.name);
  private readonly baseUrl: string;
  private readonly token?: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('STRAPI_URL') || 'http://cms:1337';
    this.token = this.config.get<string>('STRAPI_TOKEN');
  }

  private mapError(err: unknown, method: 'GET' | 'POST', path: string): never {
    if (isAxiosError(err)) {
      const status = err.response?.status ?? HttpStatus.BAD_GATEWAY;
      const fromCms = err.response?.data;
      this.logger.warn(
        `Strapi ${method} ${path} -> ${String(status)} ${err.message}`,
      );
      throw new HttpException(
        fromCms ?? { error: { message: 'CMS proxy error' } },
        status,
      );
    }
    this.logger.error(
      `Unexpected proxy error ${method} ${path}`,
      err instanceof Error ? err.stack : undefined,
    );
    throw new HttpException(
      { error: { message: 'CMS proxy error' } },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async get(path: string, params?: Record<string, any>): Promise<unknown> {
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
    } catch (err) {
      this.mapError(err, 'GET', path);
    }
  }

  async post(path: string, body: unknown): Promise<unknown> {
    try {
      const res = await firstValueFrom(
        this.http.post(`${this.baseUrl}/api${path}`, body, {
          headers: {
            'Content-Type': 'application/json',
            ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
          },
        }),
      );
      return res.data;
    } catch (err) {
      this.mapError(err, 'POST', path);
    }
  }
}
