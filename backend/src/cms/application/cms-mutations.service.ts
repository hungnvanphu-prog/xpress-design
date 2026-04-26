import { Injectable } from '@nestjs/common';
import { StrapiProxyService } from '../infrastructure/strapi-proxy.service';
import type { CreateInsightSignupDto } from '../dto/create-insight-signup.dto';
import type { CreateContactRequestDto } from '../dto/create-contact-request.dto';

/**
 * Use case: ghi dữ liệu form / đăng ký vào Strapi (map DTO → payload API).
 */
@Injectable()
export class CmsMutationsService {
  constructor(private readonly strapi: StrapiProxyService) {}

  createInsightSignup(dto: CreateInsightSignupDto) {
    const data: Record<string, unknown> = {
      email: dto.email.trim().toLowerCase(),
      source: dto.source,
    };
    const name = dto.name?.trim();
    if (name) data.name = name;
    const loc = dto.locale?.trim();
    if (loc) data.locale = loc;
    return this.strapi.post('/insight-signups', { data });
  }

  createContactRequest(dto: CreateContactRequestDto) {
    const data: Record<string, unknown> = {
      name: dto.name.trim(),
    };
    const phone = dto.phone?.trim();
    if (phone) data.phone = phone;
    const email = dto.email?.trim();
    if (email) data.email = email;
    const service = dto.service?.trim();
    if (service) data.service = service;
    const budget = dto.budget?.trim();
    if (budget) data.budget = budget;
    const message = dto.message?.trim();
    if (message) data.message = message;
    const loc = dto.locale?.trim();
    if (loc) data.locale = loc;
    return this.strapi.post('/contact-requests', { data });
  }
}
