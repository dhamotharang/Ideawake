import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShortcutController } from './shortcut.controller';
import { ShortcutService } from './shortcut.service';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../../modules/user/user.module';
import { ShortcutRepository } from './shortcut.repository';
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
      ShortcutRepository,
      EntityTypeRepository,
      CommunityRepository,
    ]),
    SharedModule,
    UserModule,
    forwardRef(() => EntityTypeModule),
    forwardRef(() => CommunityModule),
  ],
  controllers: [ShortcutController],
  exports: [ShortcutService, EntityTypeService],
  providers: [
    ShortcutService,
    EntityTypeService,
    CommunityService,
    MicroServiceClient,
  ],
})
export class ShortcutModule {}
