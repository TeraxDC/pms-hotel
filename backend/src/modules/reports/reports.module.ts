import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Room } from '../rooms/entities/room.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CashShift } from '../cash/entities/cash-shift.entity';
import { CashMovement } from '../cash/entities/cash-movement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room,
      Reservation,
      CashShift,
      CashMovement,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
