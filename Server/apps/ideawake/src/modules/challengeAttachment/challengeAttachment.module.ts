import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeAttachmentRepository } from './challengeAttachment.repository';
import { ChallengeAttachmentController } from './challengeAttachment.controller';
import { ChallengeAttachmentService } from './challengeAttachment.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChallengeAttachmentRepository]),
    forwardRef(() => UserModule),
  ],
  controllers: [ChallengeAttachmentController],
  exports: [ChallengeAttachmentService],
  providers: [ChallengeAttachmentService],
})
export class ChallengeAttachmentModule {}
