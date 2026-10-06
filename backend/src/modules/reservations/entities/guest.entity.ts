import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { DocumentType } from '../../statuses/entities/document-type.entity';

@Entity('guests')
export class Guest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'document_type_id' })
  document_type_id: number;

  @ManyToOne(() => DocumentType, { eager: true })
  @JoinColumn({ name: 'document_type_id' })
  document_type: DocumentType;

  @Column({ length: 50 })
  document_number: string;

  @Column({ length: 100 })
  first_name: string;

  @Column({ length: 100 })
  last_name: string;

  @Column({ length: 150, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  phone: string;

  @Column({ length: 100, default: 'Nacional' })
  nationality: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
