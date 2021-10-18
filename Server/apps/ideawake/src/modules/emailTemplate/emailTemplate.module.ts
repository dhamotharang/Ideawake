import { forwardRef, Module } from '@nestjs/common';
import { EmailTemplatesController } from './emailTemplate.controller';
import { EmailTemplateService } from './emailTemplate.service';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [forwardRef(() => CommunityModule)],
  controllers: [EmailTemplatesController],
  providers: [EmailTemplateService, MicroServiceClient],
})
export class EmailTemplateModule {}
