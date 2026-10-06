import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Room } from './room.entity';

@Entity('room_types')
export class RoomType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Habitación Simple, Matrimonial Clásica, Doble Superior, Suite Presidencial

  @Column({ length: 50, unique: true })
  code: string; // IND, MAT, DOB, SUI

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: 2 })
  max_capacity: number;

  @Column({ length: 100, nullable: true })
  bed_summary: string; // "1 Cama King Size" o "2 Camas Individuales"

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
  base_price: number;

  @Column({ type: 'json', nullable: true })
  amenities: string[]; // ['wifi', 'tv', 'ac', 'shower', 'frigobar']

  @Column({ type: 'json', nullable: true })
  photos: string[];

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Room, (room) => room.room_type)
  rooms: Room[];
}
