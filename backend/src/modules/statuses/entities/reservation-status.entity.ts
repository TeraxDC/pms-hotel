import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('reservation_statuses')
export class ReservationStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW

  @Column({ length: 100 })
  name: string; // Pendiente, Confirmada, Con Check-In, Finalizada, Cancelada, No-Show

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: '#3B82F6' })
  color_hex: string;

  @Column({ length: 20, default: '#DBEAFE' })
  badge_bg_hex: string;

  @Column({ length: 20, default: '#1E40AF' })
  badge_text_hex: string;

  @Column({ length: 50, default: 'calendar' })
  icon_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @Column({ default: 0 })
  display_order: number;
}
