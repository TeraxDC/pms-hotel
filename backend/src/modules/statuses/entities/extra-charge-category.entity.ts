import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('extra_charge_categories')
export class ExtraChargeCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string; // Frigobar, Lavandería, Restaurante, Estacionamiento, Daños

  @Column({ length: 50, default: 'shopping-bag' })
  icon_name: string;

  @Column({ default: true })
  is_active: boolean;
}
