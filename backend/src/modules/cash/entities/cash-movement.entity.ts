import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { CashShift } from './cash-shift.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cash_movements')
export class CashMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shift_id' })
  shift_id: number;

  @ManyToOne(() => CashShift, (shift) => shift.movements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: CashShift;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ length: 20 })
  movement_type: string; // 'INCOME' o 'EXPENSE'

  @Column({ length: 150 })
  concept: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  created_at: Date;
}
