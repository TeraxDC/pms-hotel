import { Controller, Get, Post, Body } from '@nestjs/common';
import { CashService } from './cash.service';

@Controller('cash')
export class CashController {
  constructor(private readonly cashService: CashService) {}

  @Get('current')
  getCurrentShift() {
    return this.cashService.getCurrentShift();
  }

  @Post('open')
  openShift(@Body() body: { user_id: number; initial_cash: number; notes?: string }) {
    return this.cashService.openShift(body.user_id, body.initial_cash, body.notes);
  }

  @Post('movements')
  addMovement(
    @Body()
    body: {
      shift_id: number;
      user_id: number;
      movement_type: 'INCOME' | 'EXPENSE';
      concept: string;
      amount: number;
    },
  ) {
    return this.cashService.addMovement(body);
  }

  @Post('close')
  closeShift(@Body() body: { shift_id: number; actual_cash: number; notes?: string }) {
    return this.cashService.closeShift(body);
  }

  @Get('history')
  getHistory() {
    return this.cashService.getHistory();
  }
}
