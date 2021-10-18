import { Module } from '@nestjs/common';
import { MetaGraberController } from './metaGraber.controller';

@Module({
  imports: [],
  controllers: [MetaGraberController],
  exports: [],
  providers: [],
})
export class MetaGraberModule {}
