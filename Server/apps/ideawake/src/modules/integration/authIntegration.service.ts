import { Injectable } from '@nestjs/common';
import { AuthIntegrationRepository } from './authIntegration.repository';
import { AuthIntegrationEntity } from './authIntegration.entity';
import { AuthTypeEnum } from '../../enum';

@Injectable()
export class AuthIntegrationService {
  constructor(
    public readonly authIntegrationRepository: AuthIntegrationRepository,
  ) {}

  /**
   * Get authIntegrations
   */
  async getAuthIntegrations(options: {}): Promise<AuthIntegrationEntity[]> {
    return this.authIntegrationRepository.find(options);
  }

  /**
   * Get one authIntegration
   */
  async getOneAuthIntegration(options: {}): Promise<AuthIntegrationEntity> {
    return this.authIntegrationRepository.findOne(options);
  }

  /**
   * Add authIntegration
   */
  async addAuthIntegration(data: {}): Promise<AuthIntegrationEntity> {
    data['isDeleted'] = data['isDeleted'] || false;
    const authIntegrationCreated = this.authIntegrationRepository.create(data);
    return this.authIntegrationRepository.save(authIntegrationCreated);
  }

  /**
   * Add or Update AuthIntegration of a community
   * This is temporary method and will only allow one auth integration per
   * community. If multiple auth integrations are required in the future, this
   * will be replaced by the regular add & update methods.
   * @param params Integration data.
   */
  async manageAuthIntegration(params: {
    community: number;
    authProvider?: string;
    authType?: AuthTypeEnum;
    loginUrl?: string;
    clientId?: string;
  }): Promise<AuthIntegrationEntity> {
    const existingAuthIntegration = await this.getOneAuthIntegration({
      where: { community: params.community },
    });
    let result;
    if (existingAuthIntegration) {
      result = await this.updateAuthIntegration(
        { id: existingAuthIntegration.id },
        params,
      );
    } else {
      result = await this.addAuthIntegration(params);
    }
    return result;
  }

  /**
   * Update authIntegration
   */
  async updateAuthIntegration(options: {}, data: {}): Promise<{}> {
    return this.authIntegrationRepository.update(options, data);
  }

  /**
   * Soft Delete authIntegration
   */
  async softDeleteAuthIntegration(options: {}): Promise<{}> {
    return this.updateAuthIntegration(options, { isDeleted: true });
  }
}
