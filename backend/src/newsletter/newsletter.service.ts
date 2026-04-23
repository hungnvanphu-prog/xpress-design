import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscribeDto } from './dto/subscribe.dto';

@Injectable()
export class NewsletterService {
  constructor(private readonly prisma: PrismaService) {}

  async subscribe(dto: SubscribeDto) {
    const existing = await this.prisma.newsletter.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email đã đăng ký');
    return this.prisma.newsletter.create({ data: { email: dto.email } });
  }

  findAll() {
    return this.prisma.newsletter.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
