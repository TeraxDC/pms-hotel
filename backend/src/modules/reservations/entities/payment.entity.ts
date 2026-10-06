import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { Reservation } from './reservation.entity';
import { PaymentMethod } from '../../statuses/entities/payment-method.entity';
import { User } from '../../users/entities/user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'reservation_id' })
  reservation_id: number;

  @ManyToOne(() => Reservation, (res) => res.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @Column({ name: 'payment_method_id' })
  payment_method_id: number;

  @ManyToOne(() => PaymentMethod, { eager: true })
  @JoinColumn({ name: 'payment_method_id' })
  payment_method: PaymentMethod;

  @Column({ name: 'user_id', nullable: true })
  user_id: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  received_by: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ length: 100, nullable: true })
  reference_code: string; // Número de operación bancaria o voucher

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  paid_at: Date;
}
