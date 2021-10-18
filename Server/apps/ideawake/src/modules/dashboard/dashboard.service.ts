import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { DashboardEntity } from './dashboard.entity';

@Injectable()
export class DashboardService {
  constructor(public readonly dashboardRepository: DashboardRepository) {}

  /**
   * Get dashboards
   */
  async getDashboards(options: {}): Promise<DashboardEntity[]> {
    return this.dashboardRepository.find(options);
  }

  /**
   * Get single dashboard
   */
  async getDashboard(options: {}): Promise<DashboardEntity> {
    return this.dashboardRepository.findOne(options);
  }

  /**
   * Add dashboard
   */
  async addDashboard(data: {}): Promise<DashboardEntity> {
    const dashboardCreated = this.dashboardRepository.create({
      ...data,
      isDeleted: false,
    });
    return this.dashboardRepository.save(dashboardCreated);
  }

  /**
   * Update dashboard
   */
  async updateDashboard(options: {}, data: {}): Promise<{}> {
    return this.dashboardRepository.update(options, data);
  }

  /**
   * Archive dashboard
   */
  async archiveDashboard(options: {
    id: number;
    community: number;
  }): Promise<{}> {
    return this.updateDashboard(options, { isDeleted: true });
  }
}
