import { Injectable } from '@nestjs/common';
import { RoleRepository } from './role.repository';
import { RoleEntity } from './role.entity';
import { RoleLevelEnum } from '../../enum/role-level.enum';
import * as _ from 'lodash';

@Injectable()
export class RoleService {
  constructor(public readonly roleRepository: RoleRepository) {}

  /**
   * Get roles
   */
  async getRoles(options: {}): Promise<RoleEntity[]> {
    return this.roleRepository.find(options);
  }

  /**
   * Search roles based on required parameters
   * @param options search query
   */
  async searchRoles(options: {
    where: { level?: RoleLevelEnum; community?: number };
  }): Promise<RoleEntity[]> {
    return this.roleRepository
      .createQueryBuilder('role')
      .where(options.where.community ? `role.community = :community` : '1=1', {
        community: options.where.community,
      })
      .andWhere(options.where.level ? `role.level = :level` : '1=1', {
        level: options.where.level,
      })
      .getMany();
  }

  /**
   * Find one role
   */
  async getOneRole(options: {}): Promise<RoleEntity> {
    return this.roleRepository.findOne(options);
  }

  /**
   * Add role
   */
  async addRole(data: {}): Promise<RoleEntity> {
    data['abbreviation'] = _.snakeCase(data['title']);
    const roleCreated = this.roleRepository.create(data);
    return this.roleRepository.save(roleCreated);
  }

  /**
   * Update role
   */
  async updateRole(options: {}, data: {}): Promise<{}> {
    return this.roleRepository.update(options, data);
  }

  /**
   * Delete role
   */
  async deleteRole(options: {}): Promise<{}> {
    return this.roleRepository.delete(options);
  }
}
