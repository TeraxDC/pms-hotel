import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { RoomType } from './room-type.entity';
import { RoomOperationalStatus } from '../../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../../statuses/entities/room-housekeeping-status.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  room_number: string; // "101", "102", "201", "PH-1"

  @Column({ default: 1 })
  floor: number;

  @Column({ name: 'room_type_id' })
  room_type_id: number;

  @ManyToOne(() => RoomType, (type) => type.rooms, { eager: true })
  @JoinColumn({ name: 'room_type_id' })
  room_type: RoomType;

  @Column({ name: 'operational_status_id' })
  operational_status_id: number;

  @ManyToOne(() => RoomOperationalStatus, { eager: true })
  @JoinColumn({ name: 'operational_status_id' })
  operational_status: RoomOperationalStatus;

  @Column({ name: 'housekeeping_status_id' })
  housekeeping_status_id: number;

  @ManyToOne(() => RoomHousekeepingStatus, { eager: true })
  @JoinColumn({ name: 'housekeeping_status_id' })
  housekeeping_status: RoomHousekeepingStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
