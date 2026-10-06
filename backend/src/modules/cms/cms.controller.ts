import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsSection } from './entities/cms-section.entity';
import { CmsItem } from './entities/cms-item.entity';

@Controller('cms')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get('public')
  getPublicContent() {
    return this.cmsService.getPublicContent();
  }

  @Get('sections')
  getAllSections() {
    return this.cmsService.getAllSections();
  }

  @Put('sections/:id')
  updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CmsSection>,
  ) {
    return this.cmsService.updateSection(id, data);
  }

  @Post('items')
  addItem(@Body() data: Partial<CmsItem>) {
    return this.cmsService.addItem(data);
  }

  @Put('items/:id')
  updateItem(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<CmsItem>,
  ) {
    return this.cmsService.updateItem(id, data);
  }

  @Delete('items/:id')
  deleteItem(@Param('id', ParseIntPipe) id: number) {
    return this.cmsService.deleteItem(id);
  }
}
