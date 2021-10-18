import { Injectable } from '@nestjs/common';
import { CommentThreadParticipantRepository } from './commentThreadParticipant.repository';
import { CommentThreadParticipantEntity } from './commentThreadParticipant.entity';

@Injectable()
export class CommentThreadParticipantService {
  constructor(
    public readonly commentThreadParticipantRepository: CommentThreadParticipantRepository,
  ) {}

  /**
   * Get commentThreadParticipants
   */
  async getCommentThreadParticipants(options: {}): Promise<
    CommentThreadParticipantEntity[]
  > {
    return this.commentThreadParticipantRepository.find(options);
  }

  /**
   * Add commentThreadParticipant
   */
  async addCommentThreadParticipant(data: {}): Promise<
    CommentThreadParticipantEntity
  > {
    const commentThreadParticipantCreated = this.commentThreadParticipantRepository.create(
      data,
    );
    return this.commentThreadParticipantRepository.save(
      commentThreadParticipantCreated,
    );
  }

  /**
   * Update commentThreadParticipant
   */
  async updateCommentThreadParticipant(options: {}, data: {}): Promise<{}> {
    return this.commentThreadParticipantRepository.update(options, data);
  }

  /**
   * Delete commentThreadParticipant
   */
  async deleteCommentThreadParticipant(options: {}): Promise<{}> {
    return this.commentThreadParticipantRepository.delete(options);
  }
}
