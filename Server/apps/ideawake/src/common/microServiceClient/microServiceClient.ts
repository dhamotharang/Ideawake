import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '../../shared/services/config.service';

@Injectable()
/**
 * Inject Microservice Client as External depandencies
 */
export class MicroServiceClient {
  private configService = new ConfigService();
  public client(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: this.configService.get('REDIS_URL'),
      },
    });
  }
}
