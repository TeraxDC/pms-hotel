import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { ReservationRoom } from './entities/reservation-room.entity';
import { Guest } from './entities/guest.entity';
import { ExtraCharge } from './entities/extra-charge.entity';
import { Payment } from './entities/payment.entity';
import { Room } from '../rooms/entities/room.entity';
import { ReservationStatus } from '../statuses/entities/reservation-status.entity';
import { RoomOperationalStatus } from '../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../statuses/entities/room-housekeeping-status.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      ReservationRoom,
      Guest,
      ExtraCharge,
      Payment,
      Room,
      ReservationStatus,
      RoomOperationalStatus,
      RoomHousekeepingStatus,
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
