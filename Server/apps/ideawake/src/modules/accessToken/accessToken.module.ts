import { IntegrationService } from './../integration/integration.service';
import { InviteRepository } from './../invite/invite.repository';
import { Module, forwardRef } from '@nestjs/common';
import { AccessTokenController } from './accessToken.controller';
import { AuthService } from '../../modules/auth/auth.service';
import { UserService } from '../user/user.service';
import { InviteService } from '../invite/invite.service';
import { TagService } from '../tag/tag.service';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '../tag/tag.repository';
import { IntegrationModule } from '../integration/integration.module';
import { IntegrationRepository } from '../integration/integration.repository';
import { CircleService } from '../circle/circle.service';
import { CircleRepository } from '../circle/circle.repository';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    IntegrationModule,
    TypeOrmModule.forFeature([
      UserRepository,
      InviteRepository,
      TagRepository,
      IntegrationRepository,
      CircleRepository,
    ]),
    forwardRef(() => CommunityModule),
  ],
  controllers: [AccessTokenController],
  exports: [],
  providers: [
    AuthService,
    InviteService,
    TagService,
    UserService,
    IntegrationService,
    CircleService,
  ],
})
export class AccessTokenModule {}
