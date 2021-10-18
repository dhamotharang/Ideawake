import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityWisePermissionRepository } from './communityWisePermission.repository';
import { CommunityWisePermissionController } from './communityWisePermission.controller';
import { CommunityWisePermissionService } from './communityWisePermission.service';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityWisePermissionRepository])],
  controllers: [CommunityWisePermissionController],
  exports: [CommunityWisePermissionService],
  providers: [CommunityWisePermissionService],
})
export class CommunityWisePermissionModule {}
