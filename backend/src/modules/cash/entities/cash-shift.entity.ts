import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { CashMovement } from './cash-movement.entity';

@Entity('cash_shifts')
export class CashShift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  user_id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  initial_cash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_incomes: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  total_expenses: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  expected_cash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  actual_cash: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  difference: number;

  @Column({ length: 20, default: 'OPEN' })
  status: string; // 'OPEN' o 'CLOSED'

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  opened_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  closed_at: Date;

  @OneToMany(() => CashMovement, (movement) => movement.shift)
  movements: CashMovement[];
}
