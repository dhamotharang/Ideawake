import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentRepository } from './comment.repository';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { CommentThreadModule } from '../commentThread/commentThread.module';
import { CommentThreadParticipantModule } from '../commentThreadParticipant/commentThreadParticipant.module';
import { CommentAttachmentModule } from '../commentAttachment/commentAttachment.module';
import { CommentThreadGateway } from '../commentThread/commentThread.gateway';
import { MentionModule } from '../mention/mention.module';
import { UserActionPointModule } from '../userActionPoint/userActionPoint.module';
import { ActionTypeModule } from '../actionType/actionType.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([CommentRepository]),
    forwardRef(() => CommentThreadModule),
    forwardRef(() => CommentThreadParticipantModule),
    forwardRef(() => CommentAttachmentModule),
    forwardRef(() => MentionModule),
    forwardRef(() => UserActionPointModule),
    forwardRef(() => ActionTypeModule),
  ],
  controllers: [CommentController],
  exports: [
    CommentService,
    CommentThreadModule,
    CommentThreadParticipantModule,
    CommentAttachmentModule,
  ],
  providers: [CommentService, CommentThreadGateway],
})
export class CommentModule {}
