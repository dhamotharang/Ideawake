import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilterOptionRepository } from './filterOption.repository';
import { FilterOptionController } from './filterOption.controller';
import { FilterOptionService } from './filterOption.service';

@Module({
  imports: [TypeOrmModule.forFeature([FilterOptionRepository])],
  controllers: [FilterOptionController],
  exports: [FilterOptionService],
  providers: [FilterOptionService],
})
export class FilterOptionModule {}
