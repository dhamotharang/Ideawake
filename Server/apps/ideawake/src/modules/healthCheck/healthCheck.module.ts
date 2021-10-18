import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthCheckService } from './healthCheckService';

@Module({
  imports: [
    TerminusModule.forRootAsync({
      useClass: HealthCheckService,
    }),
  ],
  providers: [HealthCheckService],
  exports: [HealthCheckService],
})
export class HealthModule {}
