import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusesController } from './statuses.controller';
import { StatusesService } from './statuses.service';
import { RoomOperationalStatus } from './entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from './entities/room-housekeeping-status.entity';
import { ReservationStatus } from './entities/reservation-status.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DocumentType } from './entities/document-type.entity';
import { ExtraChargeCategory } from './entities/extra-charge-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomOperationalStatus,
      RoomHousekeepingStatus,
      ReservationStatus,
      PaymentMethod,
      DocumentType,
      ExtraChargeCategory,
    ]),
  ],
  controllers: [StatusesController],
  providers: [StatusesService],
  exports: [StatusesService],
})
export class StatusesModule {}
