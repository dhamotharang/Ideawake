import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LanguageRepository } from './language.repository';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';

@Module({
  imports: [TypeOrmModule.forFeature([LanguageRepository])],
  controllers: [LanguageController],
  exports: [LanguageService],
  providers: [LanguageService],
})
export class LanguageModule {}
