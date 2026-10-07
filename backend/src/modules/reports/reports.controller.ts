import { Controller, Get, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('kpis')
  getKpis(
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.reportsService.getKpis(startDate, endDate);
  }

  @Get('cash')
  getCashReport() {
    return this.reportsService.getCashReport();
  }
}
