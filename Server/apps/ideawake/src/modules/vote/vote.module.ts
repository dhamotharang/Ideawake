import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VoteController } from './vote.controller';
import { VoteService } from './vote.service';
import { SharedModule } from '../../shared/shared.module';
import { VoteRepository } from './vote.repository';
import { CommentModule } from '../comment/comment.module';
import { UserActionPointModule } from '../userActionPoint/userActionPoint.module';
import { ActionTypeModule } from '../actionType/actionType.module';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([VoteRepository]),
    forwardRef(() => CommentModule),
    forwardRef(() => UserActionPointModule),
    forwardRef(() => ActionTypeModule),
  ],
  controllers: [VoteController],
  exports: [VoteService, UserActionPointModule, ActionTypeModule],
  providers: [VoteService],
})
export class VoteModule {}
