import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainRepository } from './domain.repository';
import { DomainsController } from './domain.controller';
import { DomainService } from './domain.service';

@Module({
  imports: [TypeOrmModule.forFeature([DomainRepository])],
  controllers: [DomainsController],
  exports: [DomainService],
  providers: [DomainService],
})
export class DomainModule {}
