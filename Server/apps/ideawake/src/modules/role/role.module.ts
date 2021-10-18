import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleRepository } from './role.repository';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { CommunityModule } from '../community/community.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RoleRepository]),
    forwardRef(() => CommunityModule),
  ],
  controllers: [RoleController],
  exports: [RoleService],
  providers: [RoleService],
})
export class RoleModule {}
