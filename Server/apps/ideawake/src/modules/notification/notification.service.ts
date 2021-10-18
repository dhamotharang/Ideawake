import { Injectable } from '@nestjs/common';
import {
  ClientProxyFactory,
  Transport,
  ClientProxy,
} from '@nestjs/microservices';
import { ConfigService } from '../../shared/services/config.service';
const configService = new ConfigService();

@Injectable()
export class NotificationService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.REDIS,
      options: {
        url: configService.get('REDIS_URL'),
      },
    });
  }

  public notificaionmsg(data: []): Promise<[]> {
    return this.client.send('notificationService', data).toPromise();
  }
}
