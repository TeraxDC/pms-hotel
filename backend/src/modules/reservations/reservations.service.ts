import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRoom } from './entities/reservation-room.entity';
import { Guest } from './entities/guest.entity';
import { ExtraCharge } from './entities/extra-charge.entity';
import { Payment } from './entities/payment.entity';
import { Room } from '../rooms/entities/room.entity';
import { ReservationStatus } from '../statuses/entities/reservation-status.entity';
import { RoomOperationalStatus } from '../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../statuses/entities/room-housekeeping-status.entity';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(ReservationRoom)
    private readonly resRoomRepo: Repository<ReservationRoom>,
    @InjectRepository(Guest)
    private readonly guestRepo: Repository<Guest>,
    @InjectRepository(ExtraCharge)
    private readonly extraRepo: Repository<ExtraCharge>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(ReservationStatus)
    private readonly resStatusRepo: Repository<ReservationStatus>,
    @InjectRepository(RoomOperationalStatus)
    private readonly opStatusRepo: Repository<RoomOperationalStatus>,
    @InjectRepository(RoomHousekeepingStatus)
    private readonly hkStatusRepo: Repository<RoomHousekeepingStatus>,
  ) {}

  async findAll(statusId?: number) {
    const where: any = {};
    if (statusId) {
      where.status_id = statusId;
    }
    return this.reservationRepo.find({
      where,
      relations: {
        status: true,
        main_guest: true,
        rooms: { room: { room_type: true } },
      },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: {
        status: true,
        main_guest: true,
        rooms: { room: { room_type: true } },
        extra_charges: { category: true },
        payments: { payment_method: true },
      },
    });
    if (!reservation) throw new NotFoundException('Reserva no encontrada');
    return reservation;
  }

  async create(data: {
    guest: {
      document_type_id: number;
      document_number: string;
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      nationality?: string;
    };
    room_ids: number[];
    check_in_date: string;
    check_out_date: string;
    total_guests: number;
    notes?: string;
  }) {
    // 1. Buscar o registrar huésped
    let guest = await this.guestRepo.findOne({
      where: { document_number: data.guest.document_number.trim() },
    });
    if (!guest) {
      guest = this.guestRepo.create(data.guest);
      guest = await this.guestRepo.save(guest);
    } else {
      Object.assign(guest, data.guest);
      await this.guestRepo.save(guest);
    }

    // 2. Estado de reserva por defecto (CONFIRMED o PENDING)
    let status = await this.resStatusRepo.findOne({ where: { code: 'CONFIRMED' } });
    if (!status) {
      status = await this.resStatusRepo.findOne({ where: { is_active: true } });
    }

    // 3. Código único de reserva
    const code = `RES-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Calcular tarifa de habitaciones
    const rooms = await this.roomRepo.findBy({ id: In(data.room_ids) });
    let totalAccommodation = 0;
    const resRooms: ReservationRoom[] = [];

    // Calcular noches
    const d1 = new Date(data.check_in_date);
    const d2 = new Date(data.check_out_date);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    for (const r of rooms) {
      const price = Number(r.room_type?.base_price || 50);
      const subtotal = price * nights;
      totalAccommodation += subtotal;

      const rr = this.resRoomRepo.create({
        room_id: r.id,
        price_per_night: price,
      });
      resRooms.push(rr);
    }

    const reservation = this.reservationRepo.create({
      reservation_code: code,
      main_guest_id: guest.id,
      status_id: status ? status.id : 1,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      total_guests: data.total_guests || 1,
      total_accommodation: totalAccommodation,
      total_extras: 0,
      total_discount: 0,
      total_amount: totalAccommodation,
      paid_amount: 0,
      notes: data.notes,
      rooms: resRooms,
    });

    const saved = await this.reservationRepo.save(reservation);
    return this.findOne(saved.id);
  }

  async checkIn(id: number) {
    const res = await this.findOne(id);
    const checkedInStatus = await this.resStatusRepo.findOne({ where: { code: 'CHECKED_IN' } });
    const opOccupied = await this.opStatusRepo.findOne({ where: { code: 'OCCUPIED' } });

    if (checkedInStatus) {
      res.status_id = checkedInStatus.id;
      await this.reservationRepo.save(res);
    }

    if (opOccupied && res.rooms) {
      for (const rr of res.rooms) {
        if (rr.room_id) {
          await this.roomRepo.update(rr.room_id, { operational_status_id: opOccupied.id });
        }
      }
    }

    return this.findOne(id);
  }

  async checkOut(id: number) {
    const res = await this.findOne(id);
    const checkedOutStatus = await this.resStatusRepo.findOne({ where: { code: 'CHECKED_OUT' } });
    const opAvailable = await this.opStatusRepo.findOne({ where: { code: 'AVAILABLE' } });
    const hkDirty = await this.hkStatusRepo.findOne({ where: { code: 'DIRTY' } });

    if (checkedOutStatus) {
      res.status_id = checkedOutStatus.id;
      await this.reservationRepo.save(res);
    }

    if (res.rooms) {
      for (const rr of res.rooms) {
        if (rr.room_id) {
          await this.roomRepo.update(rr.room_id, {
            operational_status_id: opAvailable ? opAvailable.id : 1,
            housekeeping_status_id: hkDirty ? hkDirty.id : 2,
          });
        }
      }
    }

    return this.findOne(id);
  }

  async addExtraCharge(
    reservationId: number,
    data: { concept: string; quantity: number; unit_price: number; category_id?: number; room_id?: number },
  ) {
    const res = await this.findOne(reservationId);
    const total = Number(data.quantity) * Number(data.unit_price);

    const charge = this.extraRepo.create({
      reservation_id: reservationId,
      concept: data.concept,
      quantity: data.quantity,
      unit_price: data.unit_price,
      total_price: total,
      category_id: data.category_id,
      room_id: data.room_id,
    });
    await this.extraRepo.save(charge);

    res.total_extras = Number(res.total_extras || 0) + total;
    res.total_amount = Number(res.total_accommodation || 0) + res.total_extras - Number(res.total_discount || 0);
    await this.reservationRepo.save(res);

    return this.findOne(reservationId);
  }

  async addPayment(
    reservationId: number,
    data: { amount: number; payment_method_id: number; reference_code?: string; notes?: string },
  ) {
    const res = await this.findOne(reservationId);

    const payment = this.paymentRepo.create({
      reservation_id: reservationId,
      amount: data.amount,
      payment_method_id: data.payment_method_id,
      reference_code: data.reference_code,
      notes: data.notes,
    });
    await this.paymentRepo.save(payment);

    res.paid_amount = Number(res.paid_amount || 0) + Number(data.amount);
    await this.reservationRepo.save(res);

    return this.findOne(reservationId);
  }

  async searchGuests(query: string) {
    return this.guestRepo
      .createQueryBuilder('guest')
      .leftJoinAndSelect('guest.document_type', 'doc')
      .where('guest.document_number LIKE :q OR guest.first_name LIKE :q OR guest.last_name LIKE :q', {
        q: `%${query}%`,
      })
      .take(10)
      .getMany();
  }
}
