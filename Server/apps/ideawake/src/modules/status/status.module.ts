import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusRepository } from './status.repository';
import { StatusController } from './status.controller';
import { StatusService } from './status.service';
import { StageModule } from '../stage/stage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StatusRepository]),
    forwardRef(() => StageModule),
  ],
  controllers: [StatusController],
  exports: [StatusService],
  providers: [StatusService],
})
export class StatusModule {}
