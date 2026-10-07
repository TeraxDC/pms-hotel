import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { StatusesModule } from './modules/statuses/statuses.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { CmsModule } from './modules/cms/cms.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { UsersModule } from './modules/users/users.module';
import { CashModule } from './modules/cash/cash.module';
import { DatabaseSeederService } from './database/database-seeder.service';
import { Role } from './modules/users/entities/role.entity';
import { User } from './modules/users/entities/user.entity';
import { HotelSettings } from './modules/hotel/entities/hotel-settings.entity';
import { RoomOperationalStatus } from './modules/statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from './modules/statuses/entities/room-housekeeping-status.entity';
import { ReservationStatus } from './modules/statuses/entities/reservation-status.entity';
import { PaymentMethod } from './modules/statuses/entities/payment-method.entity';
import { DocumentType } from './modules/statuses/entities/document-type.entity';
import { ExtraChargeCategory } from './modules/statuses/entities/extra-charge-category.entity';
import { CmsSection } from './modules/cms/entities/cms-section.entity';
import { CmsItem } from './modules/cms/entities/cms-item.entity';
import { RoomType } from './modules/rooms/entities/room-type.entity';
import { Room } from './modules/rooms/entities/room.entity';
import { Guest } from './modules/reservations/entities/guest.entity';
import { Reservation } from './modules/reservations/entities/reservation.entity';
import { ReservationRoom } from './modules/reservations/entities/reservation-room.entity';
import { ExtraCharge } from './modules/reservations/entities/extra-charge.entity';
import { Payment } from './modules/reservations/entities/payment.entity';
import { CashShift } from './modules/cash/entities/cash-shift.entity';
import { CashMovement } from './modules/cash/entities/cash-movement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', '127.0.0.1'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USER', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'hotel_sjb_db'),
        autoLoadEntities: true,
        synchronize: config.get<string>('DB_SYNCHRONIZE', 'true') === 'true',
        charset: 'utf8mb4_unicode_ci',
      }),
    }),
    TypeOrmModule.forFeature([
      Role,
      User,
      HotelSettings,
      RoomOperationalStatus,
      RoomHousekeepingStatus,
      ReservationStatus,
      PaymentMethod,
      DocumentType,
      ExtraChargeCategory,
      CmsSection,
      CmsItem,
      RoomType,
      Room,
      Guest,
      Reservation,
      ReservationRoom,
      ExtraCharge,
      Payment,
      CashShift,
      CashMovement,
    ]),
    OnboardingModule,
    StatusesModule,
    AuthModule,
    RoomsModule,
    CmsModule,
    ReservationsModule,
    UsersModule,
    CashModule,
  ],
  providers: [DatabaseSeederService],
})
export class AppModule {}
