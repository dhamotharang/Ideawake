import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
@Injectable()
export class ActivityLogService {
  private client: ClientProxy;
  constructor(private readonly microServiceClient: MicroServiceClient) {
    this.client = this.microServiceClient.client();
  }
  public getUserActivityLogs(data: {
    userId: number;
    community: number;
  }): Promise<[]> {
    return this.client.send('getActivityLogByUser', data).toPromise();
  }
  public searchActivityLogs(data: {}): Promise<[]> {
    return this.client.send('searchActivityLogs', data).toPromise();
  }
  public updateReadStatus(data: {}): Promise<[]> {
    return this.client.send('updateReadStatus', data).toPromise();
  }
}
