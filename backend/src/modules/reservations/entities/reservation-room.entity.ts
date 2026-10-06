import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Room } from '../../rooms/entities/room.entity';

@Entity('reservation_rooms')
export class ReservationRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservation_id: number;

  @ManyToOne(() => Reservation, (res) => res.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ name: 'room_id' })
  room_id: number;

  @ManyToOne(() => Room, { eager: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  price_per_night: number;
}
