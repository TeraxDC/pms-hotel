import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CmsController } from './cms.controller';
import { CmsService } from './cms.service';
import { CmsSection } from './entities/cms-section.entity';
import { CmsItem } from './entities/cms-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CmsSection, CmsItem])],
  controllers: [CmsController],
  providers: [CmsService],
  exports: [CmsService],
})
export class CmsModule {}
