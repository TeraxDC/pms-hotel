import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('room_operational_statuses')
export class RoomOperationalStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // AVAILABLE, OCCUPIED, MAINTENANCE, BLOCKED

  @Column({ length: 100 })
  name: string; // Disponible, Ocupada, En Mantenimiento, Bloqueada

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: '#10B981' })
  color_hex: string;

  @Column({ length: 20, default: '#D1FAE5' })
  badge_bg_hex: string;

  @Column({ length: 20, default: '#065F46' })
  badge_text_hex: string;

  @Column({ length: 50, default: 'check-circle' })
  icon_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @Column({ default: 0 })
  display_order: number;
}
