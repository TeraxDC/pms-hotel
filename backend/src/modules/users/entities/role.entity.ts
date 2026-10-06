import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  name: string; // SUPERADMIN, ADMIN, RECEPTIONIST, HOUSEKEEPING

  @Column({ length: 100 })
  display_name: string; // Superadministrador, Administrador, Recepcionista, Camarera

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[]; // ['rooms:read', 'rooms:write', 'reservations:*', etc.]

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_system: boolean;

  @OneToMany(() => User, (user) => user.role)
  users: User[];
}
