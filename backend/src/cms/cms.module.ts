import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { CmsContentService } from './application/cms-content.service';
import { CmsMutationsService } from './application/cms-mutations.service';
import { StrapiEntityTagEnrichmentService } from './enrichment/strapi-entity-tag-enrichment.service';
import { StrapiProxyService } from './infrastructure/strapi-proxy.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [CmsController],
  providers: [
    StrapiProxyService,
    StrapiEntityTagEnrichmentService,
    CmsContentService,
    CmsMutationsService,
    CmsService,
  ],
})
export class CmsModule {}
