import {
  Module,
  forwardRef,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../../modules/user/user.module';
import { InviteModule } from '../../modules/invite/invite.module';
import { CommunityModule } from '../../modules/community/community.module';
import { TenantModule } from '../../modules/tenant/tenant.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { SamlStrategy } from './saml.strategy';
import { AccessTokenStrategy } from './accessToken.strategy';
import { JwtModule } from '@nestjs/jwt';
import { TagService } from '../../modules/tag/tag.service';
import { TagModule } from '../../modules/tag/tag.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagRepository } from '../../modules/tag/tag.repository';
import { IntegrationModule } from '../../modules/integration/integration.module';
import { AuthController } from './auth.controller';
import { UserAttachmentModule } from '../../modules/userAttachment/userAttachment.module';
import { InviteGateway } from '../../modules/invite/invite.gateway';
import { PasswordModule } from '../../modules/password/password.module';
import { CommunityService } from '../../modules/community/community.service';
import { CommunityRepository } from '../../modules/community/community.repository';
import { MicroServiceClient } from '../../common/microServiceClient/microServiceClient';
import { SamlMiddleware } from '../../middlewares';

@Module({
  imports: [
    forwardRef(() => UserModule),
    forwardRef(() => CommunityModule),
    forwardRef(() => TenantModule),
    forwardRef(() => InviteModule),
    forwardRef(() => TagModule),
    forwardRef(() => UserAttachmentModule),
    forwardRef(() => IntegrationModule),
    forwardRef(() => PasswordModule),
    TypeOrmModule.forFeature([TagRepository, CommunityRepository]),
    PassportModule,
    SharedModule,
    JwtModule.register({
      secret: 'secretKey',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    SamlStrategy,
    TagService,
    AccessTokenStrategy,
    InviteGateway,
    CommunityService,
    MicroServiceClient,
  ],
  exports: [AuthService, TagService, IntegrationModule, PassportModule],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SamlMiddleware)
      .forRoutes(
        { path: 'auth/saml', method: RequestMethod.GET },
        { path: 'auth/reply-saml/:communitySlug', method: RequestMethod.POST },
      );
  }
}
