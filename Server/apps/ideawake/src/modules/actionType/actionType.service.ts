import { Injectable } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { ConfigService } from '../../shared/services/config.service';
import { ActionTypeRepository } from './actionType.repository';
import { ActionTypeEntity } from './actionType.entity';
const configService = new ConfigService();

@Injectable()
export class ActionTypeService {
  private client: ClientProxy;

  constructor(public readonly actionTypeRepository: ActionTypeRepository) {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: configService.get('REDIS_URL'),
      },
    });
  }

  public getActionTypes(data: {}): Promise<[]> {
    return this.client.send('getActionTypes', data).toPromise();
  }
  /**
   * Get communityActionPoints
   */
  async getOwnActionTypes(options: {}): Promise<ActionTypeEntity[]> {
    return this.actionTypeRepository.find(options);
  }

  async getActionType(options: {}): Promise<ActionTypeEntity> {
    return this.actionTypeRepository.findOne(options);
  }
}
