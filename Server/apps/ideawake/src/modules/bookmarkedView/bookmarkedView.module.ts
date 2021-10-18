import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookmarkedViewRepository } from './bookmarkedView.repository';
import { BookmarkedViewController } from './bookmarkedView.controller';
import { BookmarkedViewService } from './bookmarkedView.service';
import { RoleModule } from '../role/role.module';
import { EntityVisibilitySettingModule } from '../entityVisibilitySetting/entityVisibilitySetting.module';
import { CommunityModule } from '../community/community.module';
import { UserCircleService } from '../user/userCircle.service';
import { UserCircleRepository } from '../user/userCircle.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookmarkedViewRepository, UserCircleRepository]),
    forwardRef(() => RoleModule),
    forwardRef(() => EntityVisibilitySettingModule),
    forwardRef(() => CommunityModule),
  ],
  controllers: [BookmarkedViewController],
  exports: [BookmarkedViewService],
  providers: [BookmarkedViewService, UserCircleService],
})
export class BookmarkedViewModule {}
