import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityActionPointRepository } from './communityActionPoint.repository';
import { CommunityActionPointController } from './communityActionPoint.controller';
import { CommunityActionPointService } from './communityActionPoint.service';
import { ActionTypeModule } from '../actionType/actionType.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityActionPointRepository]),
    ActionTypeModule,
  ],
  controllers: [CommunityActionPointController],
  exports: [CommunityActionPointService],
  providers: [CommunityActionPointService],
})
export class CommunityActionPointModule {}
