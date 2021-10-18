import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantRepository } from './tenant.repository';
import { TenantsController } from './tenant.controller';
import { TenantService } from './tenant.service';
import { AuthService } from '../../modules/auth/auth.service';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { InviteModule } from '../invite/invite.module';
import { TagModule } from '../tag/tag.module';
import { TagService } from '../tag/tag.service';
import { TagRepository } from '../tag/tag.repository';
import { UserAttachmentModule } from '../userAttachment/userAttachment.module';
import { UserAttachmentService } from '../userAttachment/userAttachment.service';
import { UserAttachmentRepository } from '../userAttachment/userAttachment.repository';
import { RoleActorsModule } from '../roleActors/roleActors.module';
import { RoleModule } from '../role/role.module';
import { IntegrationModule } from '../integration/integration.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantRepository,
      TagRepository,
      UserAttachmentRepository,
    ]),
    forwardRef(() => CommunityModule),
    forwardRef(() => UserModule),
    forwardRef(() => InviteModule),
    forwardRef(() => TagModule),
    forwardRef(() => UserAttachmentModule),
    forwardRef(() => RoleActorsModule),
    forwardRef(() => RoleModule),
    forwardRef(() => IntegrationModule),
  ],
  controllers: [TenantsController],
  exports: [TenantService, TagService],
  providers: [TenantService, AuthService, TagService, UserAttachmentService],
})
export class TenantModule {}
