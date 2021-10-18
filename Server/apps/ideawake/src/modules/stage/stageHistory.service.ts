import { Injectable } from '@nestjs/common';
import { StageHistoryRepository } from './stageHistory.repository';
import { StageHistoryEntity } from './stageHistory.entity';

@Injectable()
export class StageHistoryService {
  constructor(public readonly stageHistoryRepository: StageHistoryRepository) {}

  /**
   * Get stageHistory
   */
  async getStageHistory(options: {}): Promise<StageHistoryEntity[]> {
    return this.stageHistoryRepository.find(options);
  }

  /**
   * Fetch stage histories against the given stage tool (action item) and filters.
   * @param toolAbbr Stage tool Abbreviation.
   * @param filters Stage history table filters.
   * @returns Stage histories.
   */
  async getStageHistoryForStageTool(
    toolAbbr: string,
    filters: {},
  ): Promise<StageHistoryEntity[]> {
    return this.stageHistoryRepository
      .createQueryBuilder('history')
      .innerJoin('history.actionItem', 'actionItem')
      .where(filters)
      .andWhere('actionItem.abbreviation = :toolAbbr', { toolAbbr })
      .getMany();
  }

  /**
   * Add stageHistory
   */
  async addStageHistory(data: {}): Promise<StageHistoryEntity> {
    const stageHistoryCreated = this.stageHistoryRepository.create(data);
    return this.stageHistoryRepository.save(stageHistoryCreated);
  }

  /**
   * Update stageHistory
   */
  async updateStageHistory(options: {}, data: {}): Promise<{}> {
    return this.stageHistoryRepository.update(options, data);
  }

  /**
   * Delete stageHistory
   */
  async deleteStageHistory(options: {}): Promise<{}> {
    return this.stageHistoryRepository.delete(options);
  }

  /**
   * Get stage Change History For Time series
   */
  async getChangedTimeSeries(
    opportunityIds: number[],
    startAt: string,
    spanType: string,
  ): Promise<{ count: number; date: string }[]> {
    let span = 'day';
    if (spanType === 'daily') {
      span = 'day';
    } else if (spanType === 'weekly') {
      span = 'week';
    } else if (spanType === 'monthly') {
      span = 'month';
    }

    return this.stageHistoryRepository
      .createQueryBuilder('history')
      .select([
        'count(*) as count',
        `date_trunc('${span}', history.enteringAt ) as date`,
      ])
      .where('history.enteringAt >= :startAt', {
        startAt,
      })
      .andWhere('history.opportunity IN (:...opportunityIds)', {
        opportunityIds,
      })
      .groupBy(`date`)
      .getRawMany();
  }
}
