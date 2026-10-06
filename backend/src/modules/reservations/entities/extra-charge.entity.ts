import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { Room } from '../../rooms/entities/room.entity';
import { ExtraChargeCategory } from '../../statuses/entities/extra-charge-category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('extra_charges')
export class ExtraCharge {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservation_id: number;

  @ManyToOne(() => Reservation, (res) => res.extra_charges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ name: 'room_id', nullable: true })
  room_id: number;

  @ManyToOne(() => Room, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ name: 'category_id', nullable: true })
  category_id: number;

  @ManyToOne(() => ExtraChargeCategory, { eager: true, nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: ExtraChargeCategory;

  @Column({ length: 150 })
  concept: string; // "Bebida energética x2", "Servicio de lavandería 3 prendas"

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_price: number;

  @Column({ name: 'registered_by_user_id', nullable: true })
  registered_by_user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'registered_by_user_id' })
  registered_by: User;

  @CreateDateColumn()
  registered_at: Date;
}
