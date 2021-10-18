import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityVisibilitySettingRepository } from './entityVisibilitySetting.repository';
import { EntityVisibilitySettingController } from './entityVisibilitySetting.controller';
import { EntityVisibilitySettingService } from './entityVisibilitySetting.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntityVisibilitySettingRepository])],
  controllers: [EntityVisibilitySettingController],
  exports: [EntityVisibilitySettingService],
  providers: [EntityVisibilitySettingService],
})
export class EntityVisibilitySettingModule {}
