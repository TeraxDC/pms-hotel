import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomOperationalStatus } from './entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from './entities/room-housekeeping-status.entity';
import { ReservationStatus } from './entities/reservation-status.entity';
import { PaymentMethod } from './entities/payment-method.entity';
import { DocumentType } from './entities/document-type.entity';
import { ExtraChargeCategory } from './entities/extra-charge-category.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(RoomOperationalStatus)
    private readonly opStatusRepo: Repository<RoomOperationalStatus>,
    @InjectRepository(RoomHousekeepingStatus)
    private readonly hkStatusRepo: Repository<RoomHousekeepingStatus>,
    @InjectRepository(ReservationStatus)
    private readonly resStatusRepo: Repository<ReservationStatus>,
    @InjectRepository(PaymentMethod)
    private readonly payMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(DocumentType)
    private readonly docTypeRepo: Repository<DocumentType>,
    @InjectRepository(ExtraChargeCategory)
    private readonly extraCatRepo: Repository<ExtraChargeCategory>,
  ) {}

  // Operational Statuses
  async getOperationalStatuses() {
    return this.opStatusRepo.find({ order: { display_order: 'ASC', id: 'ASC' } });
  }

  async updateOperationalStatus(id: number, updateData: Partial<RoomOperationalStatus>) {
    const status = await this.opStatusRepo.findOne({ where: { id } });
    if (!status) throw new NotFoundException('Estado operativo no encontrado');
    Object.assign(status, updateData);
    return this.opStatusRepo.save(status);
  }

  // Housekeeping Statuses
  async getHousekeepingStatuses() {
    return this.hkStatusRepo.find({ order: { display_order: 'ASC', id: 'ASC' } });
  }

  async updateHousekeepingStatus(id: number, updateData: Partial<RoomHousekeepingStatus>) {
    const status = await this.hkStatusRepo.findOne({ where: { id } });
    if (!status) throw new NotFoundException('Estado de limpieza no encontrado');
    Object.assign(status, updateData);
    return this.hkStatusRepo.save(status);
  }

  // Reservation Statuses
  async getReservationStatuses() {
    return this.resStatusRepo.find({ order: { display_order: 'ASC', id: 'ASC' } });
  }

  async updateReservationStatus(id: number, updateData: Partial<ReservationStatus>) {
    const status = await this.resStatusRepo.findOne({ where: { id } });
    if (!status) throw new NotFoundException('Estado de reserva no encontrado');
    Object.assign(status, updateData);
    return this.resStatusRepo.save(status);
  }

  // Other catalogs
  async getPaymentMethods() {
    return this.payMethodRepo.find({ order: { display_order: 'ASC', id: 'ASC' } });
  }

  async getDocumentTypes() {
    return this.docTypeRepo.find({ where: { is_active: true } });
  }

  async getExtraCategories() {
    return this.extraCatRepo.find({ where: { is_active: true }, order: { id: 'ASC' } });
  }

  async getAllExtraCategories() {
    return this.extraCatRepo.find({ order: { id: 'ASC' } });
  }

  async createExtraCategory(data: Partial<ExtraChargeCategory>) {
    const cat = this.extraCatRepo.create(data);
    return this.extraCatRepo.save(cat);
  }

  async updateExtraCategory(id: number, data: Partial<ExtraChargeCategory>) {
    const cat = await this.extraCatRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    Object.assign(cat, data);
    return this.extraCatRepo.save(cat);
  }

  async deleteExtraCategory(id: number) {
    const cat = await this.extraCatRepo.findOne({ where: { id } });
    if (!cat) throw new NotFoundException('Categoría no encontrada');
    await this.extraCatRepo.delete(id);
    return { success: true };
  }
}
