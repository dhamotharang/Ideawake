import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OpportunityAttachmentRepository } from './opportunityAttachment.repository';
import { OpportunityAttachmentController } from './opportunityAttachment.controller';
import { OpportunityAttachmentService } from './opportunityAttachment.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OpportunityAttachmentRepository]),
    forwardRef(() => UserModule),
  ],
  controllers: [OpportunityAttachmentController],
  exports: [OpportunityAttachmentService],
  providers: [OpportunityAttachmentService],
})
export class OpportunityAttachmentModule {}
