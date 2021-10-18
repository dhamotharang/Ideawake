import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TagReferenceMappingRepository } from './tagReferenceMapping.repository';
import { TagReferenceMappingController } from './tagReferenceMapping.controller';
import { TagReferenceMappingService } from './tagReferenceMapping.service';

@Module({
  imports: [TypeOrmModule.forFeature([TagReferenceMappingRepository])],
  controllers: [TagReferenceMappingController],
  exports: [TagReferenceMappingService],
  providers: [TagReferenceMappingService],
})
export class TagReferenceMappingModule {}
