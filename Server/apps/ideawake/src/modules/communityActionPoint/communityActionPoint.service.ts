import { Injectable } from '@nestjs/common';
import { CommunityActionPointRepository } from './communityActionPoint.repository';
import { CommunityActionPointEntity } from './communityActionPoint.entity';

@Injectable()
export class CommunityActionPointService {
  constructor(
    public readonly communityActionPointRepository: CommunityActionPointRepository,
  ) {}

  /**
   * Get communityActionPoints
   */
  async getCommunityActionPoints(options: {}): Promise<
    CommunityActionPointEntity[]
  > {
    return this.communityActionPointRepository.find(options);
  }

  /**
   * Add communityActionPoint
   */
  async addCommunityActionPoint(data: {}): Promise<CommunityActionPointEntity> {
    const communityActionPointCreated = this.communityActionPointRepository.create(
      data,
    );
    return this.communityActionPointRepository.save(
      communityActionPointCreated,
    );
  }

  /**
   * Update communityActionPoint
   */
  async updateCommunityActionPoint(options: {}, data: {}): Promise<{}> {
    return this.communityActionPointRepository.update(options, data);
  }

  /**
   * Delete communityActionPoint
   */
  async deleteCommunityActionPoint(options: {}): Promise<{}> {
    return this.communityActionPointRepository.delete(options);
  }
}
