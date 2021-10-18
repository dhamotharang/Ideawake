import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityBasePermissionRepository } from './communityBasePermission.repository';
import { CommunityBasePermissionController } from './communityBasePermission.controller';
import { CommunityBasePermissionService } from './communityBasePermission.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityBasePermissionRepository]),
    forwardRef(() => UserModule),
  ],
  controllers: [CommunityBasePermissionController],
  exports: [CommunityBasePermissionService],
  providers: [CommunityBasePermissionService],
})
export class CommunityBasePermissionModule {}
