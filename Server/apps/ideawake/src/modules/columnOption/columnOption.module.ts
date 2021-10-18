import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ColumnOptionRepository } from './columnOption.repository';
import { ColumnOptionController } from './columnOption.controller';
import { ColumnOptionService } from './columnOption.service';

@Module({
  imports: [TypeOrmModule.forFeature([ColumnOptionRepository])],
  controllers: [ColumnOptionController],
  exports: [ColumnOptionService],
  providers: [ColumnOptionService],
})
export class ColumnOptionModule {}
