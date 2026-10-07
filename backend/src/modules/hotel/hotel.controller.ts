import { Controller, Get, Put, Body } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelSettings } from './entities/hotel-settings.entity';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Get('settings')
  getSettings() {
    return this.hotelService.getSettings();
  }

  @Put('settings')
  updateSettings(@Body() body: Partial<HotelSettings>) {
    return this.hotelService.updateSettings(body);
  }
}
