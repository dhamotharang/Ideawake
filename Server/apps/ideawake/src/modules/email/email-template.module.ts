import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplateRepository } from './email-template.repository';
import { EmailTemplatesController } from './email-template.controller';
import { EmailTemplateService } from './email-template.service';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplateRepository])],
  controllers: [EmailTemplatesController],
  exports: [EmailTemplateService],
  providers: [EmailTemplateService],
})
export class EmailModule {}
