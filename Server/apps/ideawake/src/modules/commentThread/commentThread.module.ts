import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentThreadRepository } from './commentThread.repository';
import { CommentThreadController } from './commentThread.controller';
import { CommentThreadService } from './commentThread.service';
import { VoteModule } from '../vote/vote.module';
import { VoteService } from '../vote/vote.service';
import { VoteRepository } from '../vote/vote.repository';
import { TagModule } from '../tag/tag.module';
import { TagService } from '../tag/tag.service';
import { TagRepository } from '../tag/tag.repository';
import { MentionModule } from '../mention/mention.module';
import { CommentModule } from '../comment/comment.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommentThreadRepository,
      VoteRepository,
      TagRepository,
    ]),
    forwardRef(() => VoteModule),
    forwardRef(() => TagModule),
    forwardRef(() => MentionModule),
    forwardRef(() => CommentModule),
  ],
  controllers: [CommentThreadController],
  exports: [CommentThreadService, CommentThreadController],
  providers: [
    CommentThreadService,
    VoteService,
    TagService,
    CommentThreadController,
  ],
})
export class CommentThreadModule {}
