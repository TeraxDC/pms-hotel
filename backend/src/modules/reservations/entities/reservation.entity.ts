import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Guest } from './guest.entity';
import { User } from '../../users/entities/user.entity';
import { ReservationStatus } from '../../statuses/entities/reservation-status.entity';
import { ReservationRoom } from './reservation-room.entity';
import { ExtraCharge } from './extra-charge.entity';
import { Payment } from './payment.entity';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 30 })
  reservation_code: string; // "RES-2026-0001"

  @Column({ name: 'status_id' })
  status_id: number;

  @ManyToOne(() => ReservationStatus, { eager: true })
  @JoinColumn({ name: 'status_id' })
  status: ReservationStatus;

  @Column({ name: 'main_guest_id' })
  main_guest_id: number;

  @ManyToOne(() => Guest, { eager: true })
  @JoinColumn({ name: 'main_guest_id' })
  main_guest: Guest;

  @Column({ name: 'created_by_user_id', nullable: true })
  created_by_user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_user_id' })
  created_by: User;

  @Column({ type: 'date' })
  check_in_date: string;

  @Column({ type: 'date' })
  check_out_date: string;

  @Column({ default: 1 })
  total_guests: number;

  @Column({ type: 'json', nullable: true })
  companions: { full_name: string; document_number?: string; age?: number }[];

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_accommodation: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_extras: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_discount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  paid_amount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => ReservationRoom, (rr) => rr.reservation, { cascade: true, eager: true })
  rooms: ReservationRoom[];

  @OneToMany(() => ExtraCharge, (ec) => ec.reservation)
  extra_charges: ExtraCharge[];

  @OneToMany(() => Payment, (p) => p.reservation)
  payments: Payment[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
