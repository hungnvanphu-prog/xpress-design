import { Controller, Get, Param, Query } from '@nestjs/common';
import { CmsService } from './cms.service';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('projects')
  projects(@Query() q: Record<string, any>) {
    return this.cmsService.getProjects(q);
  }

  @Get('projects/:slug')
  projectBySlug(@Param('slug') slug: string, @Query() q: Record<string, any>) {
    return this.cmsService.getProjectBySlug(slug, q);
  }

  @Get('articles')
  articles(@Query() q: Record<string, any>) {
    return this.cmsService.getArticles(q);
  }

  @Get('articles/:slug')
  articleBySlug(@Param('slug') slug: string, @Query() q: Record<string, any>) {
    return this.cmsService.getArticleBySlug(slug, q);
  }

  @Get('news')
  news(@Query() q: Record<string, any>) {
    return this.cmsService.getNews(q);
  }

  @Get('news/:slug')
  newsBySlug(@Param('slug') slug: string, @Query() q: Record<string, any>) {
    return this.cmsService.getNewsBySlug(slug, q);
  }

  @Get('pages/:slug')
  pageBySlug(@Param('slug') slug: string) {
    return this.cmsService.getPageBySlug(slug);
  }

  @Get('tags')
  tags(@Query() q: Record<string, any>) {
    return this.cmsService.getTags(q);
  }
}
