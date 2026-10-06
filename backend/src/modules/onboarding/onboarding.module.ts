import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingController } from './onboarding.controller';
import { OnboardingService } from './onboarding.service';
import { HotelSettings } from '../hotel/entities/hotel-settings.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoomType } from '../rooms/entities/room-type.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomOperationalStatus } from '../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../statuses/entities/room-housekeeping-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelSettings,
      User,
      Role,
      RoomType,
      Room,
      RoomOperationalStatus,
      RoomHousekeepingStatus,
    ]),
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService],
  exports: [OnboardingService],
})
export class OnboardingModule {}
