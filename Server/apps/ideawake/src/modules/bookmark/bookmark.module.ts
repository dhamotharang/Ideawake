import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkController } from './bookmark.controller';
import { BookmarkService } from './bookmark.service';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { BookmarkRepository } from './bookmark.repository';
import { EntityTypeModule } from '../entityType/entity.module';
import { EntityTypeService } from '../entityType/entity.service';
import { EntityTypeRepository } from '../entityType/entity.repository';
import { CommunityRepository } from '../community/community.repository';
import { CommunityService } from '../community/community.service';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { CommunityModule } from '../community/community.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      BookmarkRepository,
      EntityTypeRepository,
      CommunityRepository,
    ]),
    forwardRef(() => UserModule),
    forwardRef(() => SharedModule),
    forwardRef(() => EntityTypeModule),
    forwardRef(() => CommunityModule),
  ],
  controllers: [BookmarkController],
  exports: [BookmarkService, EntityTypeService],
  providers: [
    BookmarkService,
    EntityTypeService,
    CommunityService,
    MicroServiceClient,
  ],
})
export class BookmarkModule {}
