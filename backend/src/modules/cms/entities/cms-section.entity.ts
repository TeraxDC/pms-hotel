import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CmsItem } from './cms-item.entity';

@Entity('cms_sections')
export class CmsSection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  section_key: string; // "hero", "about", "amenities", "gallery", "contact", "policies"

  @Column({ length: 150 })
  title: string;

  @Column({ length: 255, nullable: true })
  subtitle: string;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => CmsItem, (item) => item.section, { cascade: true, eager: true })
  items: CmsItem[];
}
