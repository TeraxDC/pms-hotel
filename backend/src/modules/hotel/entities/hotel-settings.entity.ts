import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('hotel_settings')
export class HotelSettings {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 150 })
  hotel_name: string;

  @Column({ length: 150, nullable: true })
  trade_name: string;

  @Column({ length: 50, nullable: true })
  tax_id: string; // RUC, NIT, RFC, CIF

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ length: 100, nullable: true })
  country: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 50, nullable: true })
  whatsapp: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  logo_url: string;

  @Column({ type: 'text', nullable: true })
  favicon_url: string;

  @Column({ length: 10, default: 'USD' })
  primary_currency: string;

  @Column({ length: 5, default: '$' })
  currency_symbol: string;

  @Column({ length: 10, nullable: true })
  secondary_currency: string;

  @Column({ length: 50, default: 'IGV' })
  tax_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 18.00 })
  tax_percentage: number;

  @Column({ length: 10, default: '14:00' })
  check_in_time: string;

  @Column({ length: 10, default: '11:00' })
  check_out_time: string;

  @Column({ default: false })
  is_configured: boolean;

  @Column({ type: 'text', nullable: true })
  cancellation_policy: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number;

  @Column({ type: 'int', default: 16 })
  map_zoom: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
