import {
  TerminusOptionsFactory,
  TerminusEndpoint,
  TerminusModuleOptions,
  DNSHealthIndicator,
  TypeOrmHealthIndicator,
  MicroserviceHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { Injectable } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConfigService } from '../../shared/services/config.service';

@Injectable()
export class HealthCheckService implements TerminusOptionsFactory {
  private configService = new ConfigService();
  constructor(
    private readonly dns: DNSHealthIndicator,
    private readonly microservice: MicroserviceHealthIndicator,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  public createTerminusOptions(): TerminusModuleOptions {
    const healthEndpoint: TerminusEndpoint = {
      url: '/health',
      healthIndicators: [
        /**
         * DNS and HTTP Request Health Check
         * @returns Promised base object having DNS and HTTP status
         */
        async (): Promise<{}> =>
          this.dns.pingCheck('Main App', 'https://google.com'),

        /**
         * Redis connection Health Check
         * @returns Promised base object having redis connection status
         */
        async (): Promise<{}> =>
          this.microservice.pingCheck('Redis', {
            transport: Transport.REDIS,
            options: {
              url: this.configService.get('REDIS_URL'),
            },
          }),

        /**
         * Database connection Health Check
         * @returns Promised base object having database connection status
         */
        async (): Promise<{}> =>
          this.db.pingCheck('Database', { timeout: 1000 }),

        /**
         * Memory Heap Size Health Check
         * @returns Promised base object having heap memory status
         */

        async (): Promise<{}> =>
          this.memory.checkHeap('MemoryHeap', 2000 * 1024 * 1024),

        /**
         * Memory RSS Health Check
         * @returns Promised base object having RSS memory status
         */

        async (): Promise<{}> =>
          this.memory.checkRSS('MemoryRSS', 3000 * 1024 * 1024),

        /**
         * Disk Occupied Threshold Health Check
         * @returns Promised base object having occupied disk threshold status
         */

        async (): Promise<{}> =>
          this.disk.checkStorage('disk', {
            thresholdPercent: 0.85, // 85 percent occupied
            path: '/',
          }),
      ],
    };
    return {
      endpoints: [healthEndpoint],
      disableDeprecationWarnings: true,
    };
  }
}
