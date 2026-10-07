import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  getAll(@Query('status_id') statusId?: string) {
    return this.reservationsService.findAll(statusId ? parseInt(statusId, 10) : undefined);
  }

  @Get('guests')
  searchGuests(@Query('q') q: string) {
    return this.reservationsService.searchGuests(q || '');
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.reservationsService.create(body);
  }

  @Post(':id/checkin')
  checkIn(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reservationsService.checkIn(id, body);
  }

  @Post(':id/checkout')
  checkOut(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reservationsService.checkOut(id, body);
  }

  @Post(':id/reassign-room')
  reassignRoom(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reservationsService.reassignRoom(id, body.old_room_id, body.new_room_id);
  }

  @Post(':id/extras')
  addExtra(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reservationsService.addExtraCharge(id, body);
  }

  @Post(':id/payments')
  addPayment(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.reservationsService.addPayment(id, body);
  }

  @Post(':id/discount')
  applyDiscount(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { discount_amount: number; reason?: string },
  ) {
    return this.reservationsService.applyDiscount(id, body);
  }
}
