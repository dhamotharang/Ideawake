import { Injectable } from '@nestjs/common';
import { DomainRepository } from './domain.repository';
import { DomainEntity } from './domain.entity';

@Injectable()
export class DomainService {
  constructor(public readonly domainRepository: DomainRepository) {}

  /**
   * Get domains
   */
  async getDomains(options: {}): Promise<DomainEntity[]> {
    return this.domainRepository.find(options);
  }

  /**
   * Add domain
   */
  async addDomain(data: {}): Promise<DomainEntity> {
    const domainCreated = this.domainRepository.create(data);
    return this.domainRepository.save(domainCreated);
  }

  /**
   * Update domain
   */
  async updateDomain(options: {}, data: {}): Promise<{}> {
    return this.domainRepository.update(options, data);
  }

  /**
   * Delete domain
   */
  async deleteDomain(options: {}): Promise<{}> {
    return this.domainRepository.delete(options);
  }
}
