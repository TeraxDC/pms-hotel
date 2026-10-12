import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CashController } from './cash.controller';
import { CashService } from './cash.service';
import { CashShift } from './entities/cash-shift.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../reservations/entities/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CashShift, CashMovement, User, Payment])],
  controllers: [CashController],
  providers: [CashService],
  exports: [CashService],
})
export class CashModule {}
