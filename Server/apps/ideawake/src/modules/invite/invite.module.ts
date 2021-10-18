import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InviteRepository } from './invite.repository';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';
import { InviteGateway } from './invite.gateway';
import { CommunityModule } from '../community/community.module';
import { UserModule } from '../user/user.module';
import { SharedModule } from '../../shared/shared.module';
import { EmailModule } from '../email/email-template.module';
import { CircleModule } from '../circle/circle.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InviteRepository]),
    forwardRef(() => CommunityModule),
    forwardRef(() => UserModule),
    forwardRef(() => EmailModule),
    forwardRef(() => CircleModule),
    SharedModule,
  ],
  controllers: [InviteController],
  exports: [InviteService],
  providers: [InviteService, InviteGateway],
})
export class InviteModule {}
