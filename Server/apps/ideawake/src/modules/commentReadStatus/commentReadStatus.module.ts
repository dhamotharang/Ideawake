import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeRepository } from './commentReadStatus.repository';
import { ThemeController } from './commentReadStatus.controller';
import { ThemeService } from './commentReadStatus.service';

@Module({
  imports: [TypeOrmModule.forFeature([ThemeRepository])],
  controllers: [ThemeController],
  exports: [ThemeService],
  providers: [ThemeService],
})
export class ThemeModule {}
