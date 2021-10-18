import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordPolicyRepository } from './password-policy.repository';
import { PasswordResetRepository } from './password-reset.repository';
import { PasswordPolicyController } from './password-policy.controller';
import { PasswordResetController } from './password-reset.controller';
import { PasswordPolicyService } from './password-policy.service';
import { PasswordResetService } from './password-reset.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PasswordPolicyRepository,
      PasswordResetRepository,
    ]),
    forwardRef(() => UserModule),
  ],
  controllers: [PasswordPolicyController, PasswordResetController],
  exports: [PasswordPolicyService, PasswordResetService],
  providers: [PasswordPolicyService, PasswordResetService],
})
export class PasswordModule {}
