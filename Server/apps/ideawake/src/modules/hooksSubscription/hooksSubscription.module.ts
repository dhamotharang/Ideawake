import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HooksSubscriptionController } from './hooksSubscription.controller';
import { HooksSubscriptionService } from './hooksSubscription.service';
import { HooksSubscriptionRepository } from './hooksSubscription.repository';

@Module({
  imports: [TypeOrmModule.forFeature([HooksSubscriptionRepository])],
  controllers: [HooksSubscriptionController],
  providers: [HooksSubscriptionService],
})
export class HooksSubscriptionModule {}
