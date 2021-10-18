import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowingContentController } from './followingContent.controller';
import { FollowingContentService } from './followingContent.service';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { FollowingContentRepository } from './followingContent.repository';
import { EntityTypeModule } from '../entityType/entity.module';
import { EntityTypeService } from '../entityType/entity.service';
import { EntityTypeRepository } from '../entityType/entity.repository';
import { CommunityRepository } from '../community/community.repository';
import { CommunityService } from '../community/community.service';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { CommunityModule } from '../community/community.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      FollowingContentRepository,
      EntityTypeRepository,
      CommunityRepository,
      UserRepository,
    ]),
    SharedModule,
    forwardRef(() => UserModule),
    forwardRef(() => EntityTypeModule),
    forwardRef(() => UserModule),
    forwardRef(() => CommunityModule),
  ],
  controllers: [FollowingContentController],
  exports: [FollowingContentService, EntityTypeService],
  providers: [
    FollowingContentService,
    EntityTypeService,
    CommunityService,
    UserService,
    MicroServiceClient,
  ],
})
export class FollowingContentModule {}
