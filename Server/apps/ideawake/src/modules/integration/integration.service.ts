import { Injectable } from '@nestjs/common';
import { IntegrationRepository } from './integration.repository';
import { IntegrationEntity } from './integration.entity';

@Injectable()
export class IntegrationService {
  constructor(public readonly integrationRepository: IntegrationRepository) {}

  /**
   * Get integrations
   */
  async getIntegrations(options: {}): Promise<IntegrationEntity[]> {
    return this.integrationRepository.find(options);
  }

  /**
   * Get one integration
   */
  async getOneIntegration(options: {}): Promise<IntegrationEntity> {
    return this.integrationRepository.findOne(options);
  }

  /**
   * Add integration
   */
  async addIntegration(data: {}): Promise<IntegrationEntity> {
    data['isDeleted'] = data['isDeleted'] || false;
    const integrationCreated = this.integrationRepository.create(data);
    return this.integrationRepository.save(integrationCreated);
  }

  /**
   * Update integration
   */
  async updateIntegration(options: {}, data: {}): Promise<{}> {
    return this.integrationRepository.update(options, data);
  }

  /**
   * Soft Delete integration
   */
  async softDeleteIntegration(options: {}): Promise<{}> {
    return this.updateIntegration(options, { isDeleted: true });
  }
}
