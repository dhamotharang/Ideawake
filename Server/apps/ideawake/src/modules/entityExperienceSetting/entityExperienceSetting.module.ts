import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityExperienceSettingRepository } from './entityExperienceSetting.repository';
import { EntityExperienceSettingController } from './entityExperienceSetting.controller';
import { EntityExperienceSettingService } from './entityExperienceSetting.service';

@Module({
  imports: [TypeOrmModule.forFeature([EntityExperienceSettingRepository])],
  controllers: [EntityExperienceSettingController],
  exports: [EntityExperienceSettingService],
  providers: [EntityExperienceSettingService],
})
export class EntityExperienceSettingModule {}
