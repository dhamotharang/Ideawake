import { Injectable } from '@nestjs/common';
import { TenantRepository } from './tenant.repository';
import { TenantEntity } from './tenant.entity';

@Injectable()
export class TenantService {
  constructor(public readonly tenantRepository: TenantRepository) {}

  /**
   * Get tenants
   */
  async getTenants(options: {}): Promise<TenantEntity[]> {
    return this.tenantRepository.find(options);
  }

  /**
   * Get one tenant
   */
  async getOneTenant(options: {}): Promise<TenantEntity> {
    return this.tenantRepository.findOne(options);
  }

  /**
   * Add tenant
   */
  async addTenant(data: {}): Promise<TenantEntity> {
    const tenantCreated = this.tenantRepository.create(data);
    return this.tenantRepository.save(tenantCreated);
  }

  /**
   * Update tenant
   */
  async updateTenant(options: {}, data: {}): Promise<{}> {
    return this.tenantRepository.update(options, data);
  }

  /**
   * Delete tenant
   */
  async deleteTenant(options: {}): Promise<{}> {
    return this.tenantRepository.delete(options);
  }
}
