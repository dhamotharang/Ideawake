import { Module } from '@nestjs/common';
import { TranslationController } from './translation.controller';
import { TranslationService } from './translation.service';

@Module({
  imports: [],
  controllers: [TranslationController],
  exports: [TranslationService],
  providers: [TranslationService],
})
export class TranslationModule {}
