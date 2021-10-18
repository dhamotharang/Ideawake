import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentAttachmentRepository } from './commentAttachment.repository';
import { CommentAttachmentController } from './commentAttachment.controller';
import { CommentAttachmentService } from './commentAttachment.service';
import { UserAttachmentModule } from '../userAttachment/userAttachment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommentAttachmentRepository]),
    forwardRef(() => UserAttachmentModule),
  ],
  controllers: [CommentAttachmentController],
  exports: [CommentAttachmentService],
  providers: [CommentAttachmentService],
})
export class CommentAttachmentModule {}
