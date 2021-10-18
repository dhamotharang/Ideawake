import { Injectable } from '@nestjs/common';
import { StatusRepository } from './status.repository';
import { StatusEntity } from './status.entity';
import { StageService } from '../stage/stage.service';
import { In } from 'typeorm';
import { groupBy } from 'lodash';

@Injectable()
export class StatusService {
  constructor(
    public readonly statusRepository: StatusRepository,
    public readonly stageService: StageService,
  ) {}

  /**
   * Get statuses
   */
  async getStatuses(options: {}): Promise<StatusEntity[]> {
    return this.statusRepository.find(options);
  }

  /**
   * Get statuses
   */
  async getStatusesWithCounts(options: {}): Promise<StatusEntity[]> {
    const challenge = options['challenge'];
    delete options['challenge'];

    const statuses = await this.getStatuses(options);

    if (statuses && statuses.length) {
      const statusIds = statuses.map(status => status.id);
      const stages = await this.stageService.getStagesWithCounts({
        where: { status: In(statusIds) },
        challenge,
      });
      const stagesGrouped = groupBy(stages, 'statusId');
      statuses.map(status => {
        status['opportunitiesCount'] = stagesGrouped[status.id]
          ? stagesGrouped[status.id].reduce(
              (prev, next) => prev + next['opportunitiesCount'],
              0,
            )
          : 0;
      });
    }
    return statuses;
  }

  /**
   * Get one status
   */
  async getOneStatus(options: {}): Promise<StatusEntity> {
    return this.statusRepository.findOne(options);
  }

  /**
   * Add status
   */
  async addStatus(data: {}): Promise<StatusEntity> {
    const statusCreated = this.statusRepository.create(data);
    return this.statusRepository.save(statusCreated);
  }

  /**
   * Update status
   */
  async updateStatus(options: {}, data: {}): Promise<{}> {
    return this.statusRepository.update(options, data);
  }

  /**
   * Delete status
   */
  async deleteStatus(options: {}): Promise<{}> {
    return this.updateStatus(options, { isDeleted: true });
  }
}
