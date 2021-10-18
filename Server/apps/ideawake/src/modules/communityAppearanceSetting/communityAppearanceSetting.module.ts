import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityAppearanceSettingRepository } from './communityAppearanceSetting.repository';
import { CommunityAppearanceSettingController } from './communityAppearanceSetting.controller';
import { CommunityAppearanceSettingService } from './communityAppearanceSetting.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityAppearanceSettingRepository])],
  controllers: [CommunityAppearanceSettingController],
  exports: [CommunityAppearanceSettingService],
  providers: [CommunityAppearanceSettingService],
})
export class CommunityAppearanceSettingModule {}
