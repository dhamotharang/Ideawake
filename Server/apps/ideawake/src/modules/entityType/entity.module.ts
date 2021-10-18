import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityTypeController } from './entity.controller';
import { EntityTypeService } from './entity.service';
import { SharedModule } from '../../shared/shared.module';
import { UserModule } from '../user/user.module';
import { EntityTypeRepository } from './entity.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([EntityTypeRepository]),
    forwardRef(() => UserModule),
    forwardRef(() => SharedModule),
  ],
  controllers: [EntityTypeController],
  exports: [EntityTypeService],
  providers: [EntityTypeService],
})
export class EntityTypeModule {}
