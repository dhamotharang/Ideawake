import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeRepository } from './theme.repository';
import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [TypeOrmModule.forFeature([ThemeRepository])],
  controllers: [ThemeController],
  exports: [ThemeService],
  providers: [ThemeService],
})
export class ThemeModule {}
