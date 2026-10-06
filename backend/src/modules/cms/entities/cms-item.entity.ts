import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from 'typeorm';
import { CmsSection } from './cms-section.entity';

@Entity('cms_items')
export class CmsItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'section_id' })
  section_id: number;

  @ManyToOne(() => CmsSection, (section) => section.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'section_id' })
  section: CmsSection;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'text', nullable: true })
  image_url: string;

  @Column({ length: 50, nullable: true })
  icon_name: string;

  @Column({ length: 255, nullable: true })
  link_url: string;

  @Column({ default: 0 })
  display_order: number;

  @Column({ default: true })
  is_active: boolean;
}
