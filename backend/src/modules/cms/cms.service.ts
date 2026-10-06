import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsSection } from './entities/cms-section.entity';
import { CmsItem } from './entities/cms-item.entity';

@Injectable()
export class CmsService {
  constructor(
    @InjectRepository(CmsSection)
    private readonly sectionRepo: Repository<CmsSection>,
    @InjectRepository(CmsItem)
    private readonly itemRepo: Repository<CmsItem>,
  ) {}

  async getPublicContent() {
    return this.sectionRepo.find({
      where: { is_active: true },
      relations: { items: true },
    });
  }

  async getAllSections() {
    return this.sectionRepo.find({ relations: { items: true } });
  }

  async updateSection(id: number, data: Partial<CmsSection>) {
    const section = await this.sectionRepo.findOne({ where: { id } });
    if (!section) throw new NotFoundException('Sección no encontrada');
    Object.assign(section, data);
    return this.sectionRepo.save(section);
  }

  async addItem(data: Partial<CmsItem>) {
    const item = this.itemRepo.create(data);
    return this.itemRepo.save(item);
  }

  async updateItem(id: number, data: Partial<CmsItem>) {
    const item = await this.itemRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Elemento no encontrado');
    Object.assign(item, data);
    return this.itemRepo.save(item);
  }

  async deleteItem(id: number) {
    await this.itemRepo.delete(id);
    return { success: true };
  }
}
