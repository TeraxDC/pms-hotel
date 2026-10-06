import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../modules/users/entities/role.entity';
import { RoomOperationalStatus } from '../modules/statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../modules/statuses/entities/room-housekeeping-status.entity';
import { ReservationStatus } from '../modules/statuses/entities/reservation-status.entity';
import { PaymentMethod } from '../modules/statuses/entities/payment-method.entity';
import { DocumentType } from '../modules/statuses/entities/document-type.entity';
import { ExtraChargeCategory } from '../modules/statuses/entities/extra-charge-category.entity';
import { CmsSection } from '../modules/cms/entities/cms-section.entity';

@Injectable()
export class DatabaseSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeederService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
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
    @InjectRepository(CmsSection)
    private readonly cmsSectionRepo: Repository<CmsSection>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('Verificando inicialización de tablas parametrizables...');
    try {
      await this.seedRoles();
      await this.seedOperationalStatuses();
      await this.seedHousekeepingStatuses();
      await this.seedReservationStatuses();
      await this.seedPaymentMethods();
      await this.seedDocumentTypes();
      await this.seedExtraCategories();
      await this.seedCmsSections();
      this.logger.log('Tablas parametrizables verificadas exitosamente.');
    } catch (err: any) {
      this.logger.warn(`Error o base de datos no conectada aún: ${err?.message || err}`);
    }
  }

  private async seedRoles() {
    const count = await this.roleRepo.count();
    if (count === 0) {
      await this.roleRepo.save([
        {
          name: 'SUPERADMIN',
          display_name: 'Superadministrador',
          description: 'Acceso total y configuración de todo el sistema',
          permissions: ['*'],
          is_system: true,
        },
        {
          name: 'ADMIN',
          display_name: 'Administrador General',
          description: 'Gestión operativa, reportes y supervisión',
          permissions: ['pms:*', 'cms:*', 'reports:*'],
          is_system: true,
        },
        {
          name: 'RECEPTIONIST',
          display_name: 'Recepcionista',
          description: 'Gestión de reservas, check-in, check-out y caja',
          permissions: ['pms:rack', 'pms:reservations', 'pms:checkin', 'pms:checkout', 'pms:cash'],
          is_system: true,
        },
        {
          name: 'HOUSEKEEPING',
          display_name: 'Personal de Limpieza',
          description: 'Módulo móvil de gobernanza y limpieza de habitaciones',
          permissions: ['pms:housekeeping'],
          is_system: true,
        },
      ]);
    }
  }

  private async seedOperationalStatuses() {
    const count = await this.opStatusRepo.count();
    if (count === 0) {
      await this.opStatusRepo.save([
        {
          code: 'AVAILABLE',
          name: 'Disponible',
          description: 'Habitación lista y disponible para ocupar',
          color_hex: '#10B981',
          badge_bg_hex: '#D1FAE5',
          badge_text_hex: '#065F46',
          icon_name: 'check-circle',
          is_system: true,
          display_order: 1,
        },
        {
          code: 'OCCUPIED',
          name: 'Ocupada',
          description: 'Habitación con huésped alojado actualmente',
          color_hex: '#EF4444',
          badge_bg_hex: '#FEE2E2',
          badge_text_hex: '#991B1B',
          icon_name: 'user',
          is_system: true,
          display_order: 2,
        },
        {
          code: 'MAINTENANCE',
          name: 'Mantenimiento',
          description: 'Habitación en reparación o fuera de servicio temporal',
          color_hex: '#6B7280',
          badge_bg_hex: '#F3F4F6',
          badge_text_hex: '#374151',
          icon_name: 'wrench',
          is_system: true,
          display_order: 3,
        },
        {
          code: 'BLOCKED',
          name: 'Bloqueada',
          description: 'Bloqueo administrativo o preventivo',
          color_hex: '#475569',
          badge_bg_hex: '#E2E8F0',
          badge_text_hex: '#1E293B',
          icon_name: 'key',
          is_system: true,
          display_order: 4,
        },
      ]);
    }
  }

  private async seedHousekeepingStatuses() {
    const count = await this.hkStatusRepo.count();
    if (count === 0) {
      await this.hkStatusRepo.save([
        {
          code: 'CLEAN',
          name: 'Limpia / Lista',
          description: 'Habitación aseada y lista para recibir huésped',
          color_hex: '#10B981',
          badge_bg_hex: '#D1FAE5',
          badge_text_hex: '#065F46',
          icon_name: 'sparkles',
          is_system: true,
          display_order: 1,
        },
        {
          code: 'DIRTY',
          name: 'Sucia',
          description: 'Habitación desocupada pendiente de aseo',
          color_hex: '#EF4444',
          badge_bg_hex: '#FEE2E2',
          badge_text_hex: '#991B1B',
          icon_name: 'clock',
          is_system: true,
          display_order: 2,
        },
        {
          code: 'IN_PROGRESS',
          name: 'En Limpieza',
          description: 'Camarera realizando el aseo actualmente',
          color_hex: '#F59E0B',
          badge_bg_hex: '#FEF3C7',
          badge_text_hex: '#92400E',
          icon_name: 'sparkles',
          is_system: true,
          display_order: 3,
        },
        {
          code: 'INSPECTED',
          name: 'Inspeccionada',
          description: 'Supervisada y aprobada por gobernanza',
          color_hex: '#3B82F6',
          badge_bg_hex: '#DBEAFE',
          badge_text_hex: '#1E40AF',
          icon_name: 'check-circle',
          is_system: true,
          display_order: 4,
        },
      ]);
    }
  }

  private async seedReservationStatuses() {
    const count = await this.resStatusRepo.count();
    if (count === 0) {
      await this.resStatusRepo.save([
        {
          code: 'PENDING',
          name: 'Pendiente de Pago',
          description: 'Reserva solicitada sin depósito completado',
          color_hex: '#F59E0B',
          badge_bg_hex: '#FEF3C7',
          badge_text_hex: '#92400E',
          icon_name: 'clock',
          is_system: true,
          display_order: 1,
        },
        {
          code: 'CONFIRMED',
          name: 'Confirmada',
          description: 'Reserva con garantía o pago confirmado',
          color_hex: '#3B82F6',
          badge_bg_hex: '#DBEAFE',
          badge_text_hex: '#1E40AF',
          icon_name: 'calendar',
          is_system: true,
          display_order: 2,
        },
        {
          code: 'CHECKED_IN',
          name: 'Check-In Activo',
          description: 'Huésped alojado en el establecimiento',
          color_hex: '#10B981',
          badge_bg_hex: '#D1FAE5',
          badge_text_hex: '#065F46',
          icon_name: 'bed',
          is_system: true,
          display_order: 3,
        },
        {
          code: 'CHECKED_OUT',
          name: 'Check-Out Finalizado',
          description: 'Estadía concluida y cuenta liquidada',
          color_hex: '#6B7280',
          badge_bg_hex: '#F3F4F6',
          badge_text_hex: '#374151',
          icon_name: 'log-out',
          is_system: true,
          display_order: 4,
        },
        {
          code: 'CANCELLED',
          name: 'Cancelada',
          description: 'Reserva anulada por cliente o recepción',
          color_hex: '#EF4444',
          badge_bg_hex: '#FEE2E2',
          badge_text_hex: '#991B1B',
          icon_name: 'x-circle',
          is_system: true,
          display_order: 5,
        },
        {
          code: 'NO_SHOW',
          name: 'No-Show',
          description: 'Cliente no se presentó sin previo aviso',
          color_hex: '#9CA3AF',
          badge_bg_hex: '#F3F4F6',
          badge_text_hex: '#4B5563',
          icon_name: 'alert-triangle',
          is_system: true,
          display_order: 6,
        },
      ]);
    }
  }

  private async seedPaymentMethods() {
    const count = await this.payMethodRepo.count();
    if (count === 0) {
      await this.payMethodRepo.save([
        { code: 'CASH', name: 'Efectivo', icon_name: 'dollar-sign', display_order: 1 },
        { code: 'CREDIT_CARD', name: 'Tarjeta de Crédito', icon_name: 'credit-card', display_order: 2 },
        { code: 'DEBIT_CARD', name: 'Tarjeta de Débito', icon_name: 'credit-card', display_order: 3 },
        { code: 'BANK_TRANSFER', name: 'Transferencia Bancaria', icon_name: 'building', display_order: 4 },
        { code: 'DIGITAL_WALLET', name: 'Billetera Digital (Yape / Plin / Bizum)', icon_name: 'phone', display_order: 5 },
      ]);
    }
  }

  private async seedDocumentTypes() {
    const count = await this.docTypeRepo.count();
    if (count === 0) {
      await this.docTypeRepo.save([
        { code: 'DNI', name: 'DNI / Cédula', min_length: 8, max_length: 10 },
        { code: 'PASSPORT', name: 'Pasaporte', min_length: 6, max_length: 15 },
        { code: 'FOREIGN_ID', name: 'Carnet de Extranjería', min_length: 6, max_length: 15 },
        { code: 'OTHER', name: 'Otro Documento', min_length: 4, max_length: 20 },
      ]);
    }
  }

  private async seedExtraCategories() {
    const count = await this.extraCatRepo.count();
    if (count === 0) {
      await this.extraCatRepo.save([
        { name: 'Frigobar / Bebidas', icon_name: 'coffee' },
        { name: 'Lavandería / Tintorería', icon_name: 'sparkles' },
        { name: 'Restaurante / Snacks', icon_name: 'coffee' },
        { name: 'Cochera / Estacionamiento', icon_name: 'key' },
        { name: 'Servicios Adicionales', icon_name: 'shopping-bag' },
        { name: 'Daños / Reposición', icon_name: 'wrench' },
      ]);
    }
  }

  private async seedCmsSections() {
    const count = await this.cmsSectionRepo.count();
    if (count === 0) {
      await this.cmsSectionRepo.save([
        {
          section_key: 'hero',
          title: 'Bienvenido a Tu Hospedaje de Ensueño',
          subtitle: 'Comodidad, elegancia y atención de primer nivel en el corazón de la ciudad.',
        },
        {
          section_key: 'about',
          title: 'Sobre Nuestro Hospedaje',
          subtitle: 'Conoce nuestras instalaciones modernas y nuestro compromiso con tu confort.',
        },
        {
          section_key: 'amenities',
          title: 'Servicios Destacados',
          subtitle: 'Todo lo que necesitas para una experiencia inolvidable.',
        },
        {
          section_key: 'contact',
          title: 'Contáctanos y Ubicación',
          subtitle: 'Estamos a tu disposición las 24 horas del día.',
        },
      ]);
    }
  }
}
