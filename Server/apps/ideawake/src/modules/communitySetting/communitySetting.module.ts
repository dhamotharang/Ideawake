import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitySettingRepository } from './communitySetting.repository';
import { CommunitySettingController } from './communitySetting.controller';
import { CommunitySettingService } from './communitySetting.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunitySettingRepository]), UserModule],
  controllers: [CommunitySettingController],
  exports: [CommunitySettingService],
  providers: [CommunitySettingService],
})
export class CommunitySettingModule {}
