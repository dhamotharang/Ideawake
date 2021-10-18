import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareController } from './share.controller';
import { ShareService } from './share.service';
import { SharedModule } from '../../shared/shared.module';
import { ShareRepository } from './share.repository';

@Module({
  imports: [SharedModule, TypeOrmModule.forFeature([ShareRepository])],
  controllers: [ShareController],
  exports: [ShareService],
  providers: [ShareService],
})
export class ShareModule {}
