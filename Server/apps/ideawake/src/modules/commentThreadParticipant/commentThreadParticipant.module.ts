import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentThreadParticipantRepository } from './commentThreadParticipant.repository';
import { CommentThreadParticipantController } from './commentThreadParticipant.controller';
import { CommentThreadParticipantService } from './commentThreadParticipant.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommentThreadParticipantRepository])],
  controllers: [CommentThreadParticipantController],
  exports: [CommentThreadParticipantService],
  providers: [CommentThreadParticipantService],
})
export class CommentThreadParticipantModule {}
