import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('document_types')
export class DocumentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string; // DNI, PASSPORT, FOREIGN_ID, OTHER

  @Column({ length: 100 })
  name: string; // DNI, Pasaporte, Carnet de Extranjería

  @Column({ length: 100, nullable: true })
  regex_pattern: string;

  @Column({ default: 1 })
  min_length: number;

  @Column({ default: 20 })
  max_length: number;

  @Column({ default: true })
  is_active: boolean;
}
