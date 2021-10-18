import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import * as redisIoAdapter from 'socket.io-redis';

import { ConfigService } from '../shared/services/config.service';

export class RedisIoAdapter extends IoAdapter {
  private configService = new ConfigService();
  private readonly redisPubClient = redisIoAdapter(
    this.configService.get('REDIS_URL'),
  );
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisPubClient);
    return server;
  }
}
