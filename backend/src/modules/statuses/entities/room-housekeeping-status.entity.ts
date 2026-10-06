import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('room_housekeeping_statuses')
export class RoomHousekeepingStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // CLEAN, DIRTY, IN_PROGRESS, INSPECTED

  @Column({ length: 100 })
  name: string; // Limpia, Sucia, En Limpieza, Inspeccionada

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 20, default: '#F59E0B' })
  color_hex: string;

  @Column({ length: 20, default: '#FEF3C7' })
  badge_bg_hex: string;

  @Column({ length: 20, default: '#92400E' })
  badge_text_hex: string;

  @Column({ length: 50, default: 'sparkles' })
  icon_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @Column({ default: 0 })
  display_order: number;
}
