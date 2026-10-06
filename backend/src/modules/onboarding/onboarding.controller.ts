import { Controller, Get, Post, Body, ValidationPipe } from '@nestjs/common';
import { OnboardingService } from './onboarding.service';
import { InitializeHotelDto } from './dto/initialize-hotel.dto';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Get('status')
  async getStatus() {
    return this.onboardingService.getStatus();
  }

  @Post('initialize')
  async initialize(@Body(new ValidationPipe({ whitelist: true })) dto: InitializeHotelDto) {
    return this.onboardingService.initialize(dto);
  }
}
