import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { HotelSettings } from '../hotel/entities/hotel-settings.entity';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RoomType } from '../rooms/entities/room-type.entity';
import { Room } from '../rooms/entities/room.entity';
import { RoomOperationalStatus } from '../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../statuses/entities/room-housekeeping-status.entity';
import { InitializeHotelDto } from './dto/initialize-hotel.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(HotelSettings)
    private readonly hotelRepo: Repository<HotelSettings>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(RoomType)
    private readonly roomTypeRepo: Repository<RoomType>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(RoomOperationalStatus)
    private readonly opStatusRepo: Repository<RoomOperationalStatus>,
    @InjectRepository(RoomHousekeepingStatus)
    private readonly hkStatusRepo: Repository<RoomHousekeepingStatus>,
  ) {}

  async getStatus(): Promise<{ isConfigured: boolean; hotel?: Partial<HotelSettings> }> {
    const hotel = await this.hotelRepo.findOne({ where: { is_configured: true } });
    if (!hotel) {
      return { isConfigured: false };
    }
    return {
      isConfigured: true,
      hotel: {
        id: hotel.id,
        hotel_name: hotel.hotel_name,
        trade_name: hotel.trade_name,
        logo_url: hotel.logo_url,
        logo_footer_url: hotel.logo_footer_url,
        favicon_url: hotel.favicon_url,
        whatsapp: hotel.whatsapp,
        phone: hotel.phone,
        email: hotel.email,
        address: hotel.address,
        city: hotel.city || '',
        country: hotel.country || '',
        primary_currency: hotel.primary_currency,
        currency_symbol: hotel.currency_symbol,
        check_in_time: hotel.check_in_time,
        check_out_time: hotel.check_out_time,
        latitude: hotel.latitude !== null && hotel.latitude !== undefined && !isNaN(Number(hotel.latitude)) ? Number(hotel.latitude) : -13.518600,
        longitude: hotel.longitude !== null && hotel.longitude !== undefined && !isNaN(Number(hotel.longitude)) ? Number(hotel.longitude) : -71.977200,
        map_zoom: hotel.map_zoom ? Number(hotel.map_zoom) : 16,
      },
    };
  }

  async initialize(dto: InitializeHotelDto) {
    const existing = await this.hotelRepo.findOne({ where: { is_configured: true } });
    if (existing) {
      throw new BadRequestException('El sistema ya ha sido configurado previamente.');
    }

    // 1. Obtener o verificar Rol SUPERADMIN
    let superRole = await this.roleRepo.findOne({ where: { name: 'SUPERADMIN' } });
    if (!superRole) {
      superRole = await this.roleRepo.save({
        name: 'SUPERADMIN',
        display_name: 'Superadministrador',
        permissions: ['*'],
        is_system: true,
      });
    }

    // 2. Crear Superadministrador
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.admin_password, salt);

    const superAdmin = this.userRepo.create({
      full_name: dto.admin_name,
      email: dto.admin_email.toLowerCase().trim(),
      password_hash: passwordHash,
      pin_code: dto.admin_pin || '1234',
      role_id: superRole.id,
      is_active: true,
    });
    await this.userRepo.save(superAdmin);

    // 3. Crear Configuración del Hotel
    const hotel = this.hotelRepo.create({
      hotel_name: dto.hotel_name,
      trade_name: dto.trade_name || dto.hotel_name,
      tax_id: dto.tax_id || '',
      address: dto.address || '',
      city: dto.city || '',
      country: dto.country || '',
      phone: dto.phone || '',
      whatsapp: dto.whatsapp,
      email: dto.email,
      logo_url: dto.logo_url || '',
      primary_currency: dto.primary_currency || 'USD',
      currency_symbol: dto.currency_symbol || '$',
      tax_name: dto.tax_name || 'IGV',
      tax_percentage: dto.tax_percentage || 18.0,
      check_in_time: dto.check_in_time || '14:00',
      check_out_time: dto.check_out_time || '11:00',
      is_configured: true,
    });
    const savedHotel = await this.hotelRepo.save(hotel);

    // 4. Inicializar categorías base de habitaciones y habitaciones iniciales si no existen
    await this.seedInitialRooms();

    return {
      message: 'Sistema inicializado exitosamente',
      hotel: savedHotel,
      admin: {
        id: superAdmin.id,
        name: superAdmin.full_name,
        email: superAdmin.email,
      },
    };
  }

  private async seedInitialRooms() {
    const count = await this.roomTypeRepo.count();
    if (count > 0) return;

    const opAvailable = await this.opStatusRepo.findOne({ where: { code: 'AVAILABLE' } });
    const hkClean = await this.hkStatusRepo.findOne({ where: { code: 'CLEAN' } });

    // Tipos de habitaciones estándar
    const tSimple = await this.roomTypeRepo.save({
      name: 'Habitación Simple Clásica',
      code: 'IND-STD',
      description: 'Ideal para viajeros de negocios o estadías cortas. Cuenta con cama de plaza y media, escritorio de trabajo y baño privado.',
      max_capacity: 1,
      bed_summary: '1 Cama Plaza y Media',
      base_price: 35.0,
      amenities: ['wifi', 'tv', 'shower', 'desk'],
      photos: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'],
    });

    const tMatrimonial = await this.roomTypeRepo.save({
      name: 'Habitación Matrimonial Confort',
      code: 'MAT-CONF',
      description: 'Amplia habitación matrimonial con cama Queen Size, vista exterior, climatización y baño de lujo con agua caliente.',
      max_capacity: 2,
      bed_summary: '1 Cama Queen Size',
      base_price: 55.0,
      amenities: ['wifi', 'tv', 'ac', 'shower', 'frigobar'],
      photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
    });

    const tDoble = await this.roomTypeRepo.save({
      name: 'Habitación Doble Superior',
      code: 'DOB-SUP',
      description: 'Diseñada para amigos o familiares, con dos cómodas camas individuales, armario amplio y área de descanso.',
      max_capacity: 2,
      bed_summary: '2 Camas Individuales',
      base_price: 65.0,
      amenities: ['wifi', 'tv', 'ac', 'shower'],
      photos: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
    });

    const tSuite = await this.roomTypeRepo.save({
      name: 'Suite Ejecutiva de Lujo',
      code: 'SUI-EXEC',
      description: 'Nuestra suite más exclusiva con cama King Size, sala de estar independiente, balcón panorámico y minibar incluido.',
      max_capacity: 3,
      bed_summary: '1 Cama King Size + Sofá Cama',
      base_price: 110.0,
      amenities: ['wifi', 'tv', 'ac', 'shower', 'frigobar', 'coffee'],
      photos: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'],
    });

    // Crear habitaciones iniciales de muestra
    if (opAvailable && hkClean) {
      await this.roomRepo.save([
        { room_number: '101', floor: 1, room_type_id: tSimple.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
        { room_number: '102', floor: 1, room_type_id: tMatrimonial.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
        { room_number: '103', floor: 1, room_type_id: tDoble.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
        { room_number: '201', floor: 2, room_type_id: tMatrimonial.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
        { room_number: '202', floor: 2, room_type_id: tDoble.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
        { room_number: '301', floor: 3, room_type_id: tSuite.id, operational_status_id: opAvailable.id, housekeeping_status_id: hkClean.id },
      ]);
    }
  }
}
