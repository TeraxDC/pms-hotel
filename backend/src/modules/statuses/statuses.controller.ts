import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { RoomOperationalStatus } from './entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from './entities/room-housekeeping-status.entity';
import { ReservationStatus } from './entities/reservation-status.entity';

@Controller('statuses')
export class StatusesController {
  constructor(private readonly statusesService: StatusesService) {}

  @Get('operational')
  getOperational() {
    return this.statusesService.getOperationalStatuses();
  }

  @Put('operational/:id')
  updateOperational(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<RoomOperationalStatus>,
  ) {
    return this.statusesService.updateOperationalStatus(id, data);
  }

  @Get('housekeeping')
  getHousekeeping() {
    return this.statusesService.getHousekeepingStatuses();
  }

  @Put('housekeeping/:id')
  updateHousekeeping(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<RoomHousekeepingStatus>,
  ) {
    return this.statusesService.updateHousekeepingStatus(id, data);
  }

  @Get('reservation')
  getReservation() {
    return this.statusesService.getReservationStatuses();
  }

  @Put('reservation/:id')
  updateReservation(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<ReservationStatus>,
  ) {
    return this.statusesService.updateReservationStatus(id, data);
  }

  @Get('payment-methods')
  getPaymentMethods() {
    return this.statusesService.getPaymentMethods();
  }

  @Get('document-types')
  getDocumentTypes() {
    return this.statusesService.getDocumentTypes();
  }

  @Get('extra-categories')
  getExtraCategories() {
    return this.statusesService.getExtraCategories();
  }
}
