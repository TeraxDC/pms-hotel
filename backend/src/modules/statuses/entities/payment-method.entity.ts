import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('payment_methods')
export class PaymentMethod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // CASH, CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, DIGITAL_WALLET

  @Column({ length: 100 })
  name: string; // Efectivo, Tarjeta de Crédito, Débito, Transferencia, Yape/Plin

  @Column({ length: 50, default: 'credit-card' })
  icon_name: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: 0 })
  display_order: number;
}
