import { Injectable } from '@nestjs/common';
import { CmsContentService } from './application/cms-content.service';
import { CmsMutationsService } from './application/cms-mutations.service';
import type { CreateInsightSignupDto } from './dto/create-insight-signup.dto';
import type { CreateContactRequestDto } from './dto/create-contact-request.dto';

/**
 * Mặt ngoài module CMS: ủy quyền cho tầng application (nội dung / ghi dữ liệu).
 * Controller phụ thuộc lớp này duy nhất, không cần biết Strapi.
 */
@Injectable()
export class CmsService {
  constructor(
    private readonly content: CmsContentService,
    private readonly mutations: CmsMutationsService,
  ) {}

  getProjects(query: Record<string, any>) {
    return this.content.getProjects(query);
  }

  getProjectBySlug(slug: string, query?: Record<string, any>) {
    return this.content.getProjectBySlug(slug, query);
  }

  getArticles(query: Record<string, any>) {
    return this.content.getArticles(query);
  }

  getArticleBySlug(slug: string, query?: Record<string, any>) {
    return this.content.getArticleBySlug(slug, query);
  }

  getNews(query: Record<string, any>) {
    return this.content.getNews(query);
  }

  getNewsBySlug(slug: string, query?: Record<string, any>) {
    return this.content.getNewsBySlug(slug, query);
  }

  getPageBySlug(slug: string) {
    return this.content.getPageBySlug(slug);
  }

  getTags(query: Record<string, any>) {
    return this.content.getTags(query);
  }

  createInsightSignup(dto: CreateInsightSignupDto) {
    return this.mutations.createInsightSignup(dto);
  }

  createContactRequest(dto: CreateContactRequestDto) {
    return this.mutations.createContactRequest(dto);
  }
}
