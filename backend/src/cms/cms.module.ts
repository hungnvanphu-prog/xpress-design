import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';

@Module({
  imports: [HttpModule.register({ timeout: 10000 })],
  controllers: [CmsController],
  providers: [CmsService],
})
export class CmsModule {}
