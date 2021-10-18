import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAttachmentRepository } from './userAttachment.repository';
import { UserAttachmentController } from './userAttachment.controller';
import { UserAttachmentService } from './userAttachment.service';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { UserRepository } from '../user/user.repository';
import { RoleActorsModule } from '../roleActors/roleActors.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserAttachmentRepository, UserRepository]),
    forwardRef(() => UserModule),
    forwardRef(() => RoleActorsModule),
  ],
  controllers: [UserAttachmentController],
  exports: [UserAttachmentService],
  providers: [UserAttachmentService, UserService],
})
export class UserAttachmentModule {}
