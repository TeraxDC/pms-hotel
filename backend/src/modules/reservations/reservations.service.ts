import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { ReservationRoom } from './entities/reservation-room.entity';
import { Guest } from './entities/guest.entity';
import { ExtraCharge } from './entities/extra-charge.entity';
import { Payment } from './entities/payment.entity';
import { Room } from '../rooms/entities/room.entity';
import { ReservationStatus } from '../statuses/entities/reservation-status.entity';
import { RoomOperationalStatus } from '../statuses/entities/room-operational-status.entity';
import { RoomHousekeepingStatus } from '../statuses/entities/room-housekeeping-status.entity';
import { PaymentMethod } from '../statuses/entities/payment-method.entity';
import { CashService } from '../cash/cash.service';

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
    @InjectRepository(PaymentMethod)
    private readonly payMethodRepo: Repository<PaymentMethod>,
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(ReservationStatus)
    private readonly resStatusRepo: Repository<ReservationStatus>,
    @InjectRepository(RoomOperationalStatus)
    private readonly opStatusRepo: Repository<RoomOperationalStatus>,
    @InjectRepository(RoomHousekeepingStatus)
    private readonly hkStatusRepo: Repository<RoomHousekeepingStatus>,
    private readonly cashService: CashService,
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
        rooms: { room: { room_type: true, housekeeping_status: true, operational_status: true } },
        extra_charges: { category: true },
        payments: { payment_method: true },
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
        rooms: { room: { room_type: true, housekeeping_status: true, operational_status: true } },
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
    is_walk_in?: boolean;
    discount_amount?: number;
    payment?: {
      amount: number;
      payment_method_id: number;
      reference_code?: string;
      notes?: string;
    };
  }) {
    if (!data.room_ids || data.room_ids.length === 0) {
      throw new BadRequestException('Debe seleccionar al menos una habitación');
    }

    const rooms = await this.roomRepo.find({
      where: { id: In(data.room_ids) },
      relations: { operational_status: true, housekeeping_status: true, room_type: true },
    });

    if (rooms.length !== data.room_ids.length) {
      throw new BadRequestException('Una o más habitaciones seleccionadas no existen');
    }

    // Validación operativa para Walk-in (debe estar Disponible y Limpia)
    if (data.is_walk_in) {
      for (const r of rooms) {
        if (r.operational_status?.code !== 'AVAILABLE') {
          throw new BadRequestException(
            `La habitación ${r.room_number} no está disponible (Estado actual: ${r.operational_status?.name || 'Ocupada'}).`,
          );
        }
        if (r.housekeeping_status?.code !== 'CLEAN') {
          throw new BadRequestException(
            `La habitación ${r.room_number} no está limpia (Estado de limpieza: ${r.housekeeping_status?.name || 'Sucia'}). Para Check-In inmediato seleccione una habitación limpia.`,
          );
        }
      }
    }

    // 1. Huésped titular (buscar existente o registrar nuevo)
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

    // 2. Estado de reserva
    let status: ReservationStatus | null = null;
    if (data.is_walk_in) {
      status = await this.resStatusRepo.findOne({ where: { code: 'CHECKED_IN' } });
    } else {
      status = await this.resStatusRepo.findOne({ where: { code: 'CONFIRMED' } });
    }
    if (!status) {
      status = await this.resStatusRepo.findOne({ where: { is_active: true } });
    }

    // 3. Código único
    const code = `${data.is_walk_in ? 'WLK' : 'RES'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Calcular noches y montos
    const d1 = new Date(data.check_in_date);
    const d2 = new Date(data.check_out_date);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    let totalAccommodation = 0;
    const resRooms: ReservationRoom[] = [];

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

    const discount = Number(data.discount_amount || 0);

    const reservation = this.reservationRepo.create({
      reservation_code: code,
      main_guest_id: guest.id,
      status_id: status ? status.id : 1,
      check_in_date: data.check_in_date,
      check_out_date: data.check_out_date,
      total_guests: data.total_guests || 1,
      total_accommodation: totalAccommodation,
      total_extras: 0,
      total_discount: discount,
      total_amount: Math.max(0, totalAccommodation - discount),
      paid_amount: 0,
      notes: data.notes,
      rooms: resRooms,
    });

    const saved = await this.reservationRepo.save(reservation);

    // Si es Walk-in, marcar habitaciones ocupadas de inmediato
    if (data.is_walk_in) {
      const opOccupied = await this.opStatusRepo.findOne({ where: { code: 'OCCUPIED' } });
      if (opOccupied) {
        for (const r of rooms) {
          await this.roomRepo.update(r.id, { operational_status_id: opOccupied.id });
        }
      }
    }

    // Registrar pago inicial si fue ingresado
    if (data.payment && Number(data.payment.amount) > 0) {
      await this.addPayment(saved.id, {
        amount: Number(data.payment.amount),
        payment_method_id: data.payment.payment_method_id,
        reference_code: data.payment.reference_code,
        notes: data.payment.notes || (data.is_walk_in ? 'Pago inicial Check-In Walk-In' : 'Anticipo de reserva'),
      });
    }

    return this.findOne(saved.id);
  }

  async checkIn(
    id: number,
    data?: {
      payment?: {
        amount: number;
        payment_method_id: number;
        reference_code?: string;
        notes?: string;
      };
      force?: boolean;
    },
  ) {
    const res = await this.findOne(id);

    // 1. Validar que la reserva esté en estado CONFIRMED o PENDING
    if (res.status?.code === 'CHECKED_IN') {
      throw new BadRequestException('La reserva ya se encuentra en estado de estadía activa (Check-In previo).');
    }
    if (res.status?.code === 'CHECKED_OUT' || res.status?.code === 'CANCELLED') {
      throw new BadRequestException(`No se puede realizar Check-In en una reserva en estado ${res.status?.name}.`);
    }

    // 2. Validar estado de gobernanza / limpieza de cada habitación
    if (res.rooms && res.rooms.length > 0) {
      for (const rr of res.rooms) {
        if (rr.room_id) {
          const room = await this.roomRepo.findOne({
            where: { id: rr.room_id },
            relations: { housekeeping_status: true, operational_status: true },
          });
          if (room) {
            if (room.housekeeping_status?.code !== 'CLEAN' && !data?.force) {
              throw new BadRequestException(
                `La habitación ${room.room_number} se encuentra en estado '${room.housekeeping_status?.name || 'Sucia'}'. Debe ser limpiada y reportada LIMPIA por camarería antes de hacer el Check-In, o reasigne la habitación.`,
              );
            }
          }
        }
      }
    }

    // 3. Registrar pago en Check-in si fue suministrado
    if (data?.payment && Number(data.payment.amount) > 0) {
      await this.addPayment(id, {
        amount: Number(data.payment.amount),
        payment_method_id: data.payment.payment_method_id,
        reference_code: data.payment.reference_code,
        notes: data.payment.notes || 'Cobro registrado durante el Check-In',
      });
    }

    // 4. Actualizar estado de la reserva a CHECKED_IN
    const checkedInStatus = await this.resStatusRepo.findOne({ where: { code: 'CHECKED_IN' } });
    if (checkedInStatus) {
      await this.reservationRepo.update(id, { status_id: checkedInStatus.id });
    }

    // 5. Actualizar estado operativo de la habitación a OCCUPIED
    const opOccupied = await this.opStatusRepo.findOne({ where: { code: 'OCCUPIED' } });
    if (opOccupied && res.rooms) {
      for (const rr of res.rooms) {
        if (rr.room_id) {
          await this.roomRepo.update(rr.room_id, { operational_status_id: opOccupied.id });
        }
      }
    }

    return this.findOne(id);
  }

  async checkOut(
    id: number,
    data?: {
      payment?: {
        amount: number;
        payment_method_id: number;
        reference_code?: string;
        notes?: string;
      };
      force?: boolean;
    },
  ) {
    const res = await this.findOne(id);

    // 1. Si se envía pago al momento del Check-Out, registrarlo primero
    if (data?.payment && Number(data.payment.amount) > 0) {
      await this.addPayment(id, {
        amount: Number(data.payment.amount),
        payment_method_id: data.payment.payment_method_id,
        reference_code: data.payment.reference_code,
        notes: data.payment.notes || 'Liquidación de cuenta al Check-Out',
      });
    }

    // 2. Validar que no quede saldo pendiente a menos que se fuerce con autorización
    const updatedRes = await this.findOne(id);
    const pendingBalance = Math.max(0, Number(updatedRes.total_amount) - Number(updatedRes.paid_amount));
    if (pendingBalance > 0 && !data?.force) {
      throw new BadRequestException(
        `La reserva cuenta con un saldo pendiente de S/. ${pendingBalance.toFixed(2)}. Debe registrar el cobro o confirmar la salida con autorización.`,
      );
    }

    // 3. Cambiar estado de la reserva a CHECKED_OUT
    const checkedOutStatus = await this.resStatusRepo.findOne({ where: { code: 'CHECKED_OUT' } });
    if (checkedOutStatus) {
      await this.reservationRepo.update(id, { status_id: checkedOutStatus.id });
    }

    // 4. Cambiar estado operativo a AVAILABLE y estado de limpieza a DIRTY (para aseo)
    const opAvailable = await this.opStatusRepo.findOne({ where: { code: 'AVAILABLE' } });
    const hkDirty = await this.hkStatusRepo.findOne({ where: { code: 'DIRTY' } });

    if (updatedRes.rooms) {
      for (const rr of updatedRes.rooms) {
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

  async cancel(
    id: number,
    data?: {
      reason?: string;
      notes?: string;
    },
  ) {
    const res = await this.findOne(id);

    if (res.status?.code === 'CANCELLED') {
      throw new BadRequestException('La reserva ya se encuentra cancelada.');
    }
    if (res.status?.code === 'CHECKED_OUT') {
      throw new BadRequestException('No se puede cancelar una reserva con Check-Out finalizado.');
    }

    const cancelledStatus = await this.resStatusRepo.findOne({ where: { code: 'CANCELLED' } });
    if (!cancelledStatus) {
      throw new BadRequestException('Estado CANCELLED no configurado en el sistema.');
    }

    const cancelDateStr = new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' });
    const cancelNote = `[CANCELACIÓN ${cancelDateStr}]: Motivo: ${data?.reason || 'Cancelado a solicitud del huésped'}${data?.notes ? ' | ' + data.notes : ''}`;
    const newNotes = res.notes ? `${res.notes}\n${cancelNote}` : cancelNote;

    await this.reservationRepo.update(id, {
      status_id: cancelledStatus.id,
      notes: newNotes,
    });

    // Liberar habitaciones asignadas (volverlas AVAILABLE)
    const opAvailable = await this.opStatusRepo.findOne({ where: { code: 'AVAILABLE' } });
    const hkDirty = await this.hkStatusRepo.findOne({ where: { code: 'DIRTY' } });

    if (res.rooms && res.rooms.length > 0) {
      for (const rr of res.rooms) {
        if (rr.room_id) {
          const updateData: any = {
            operational_status_id: opAvailable ? opAvailable.id : 1,
          };
          if (res.status?.code === 'CHECKED_IN') {
            updateData.housekeeping_status_id = hkDirty ? hkDirty.id : 2;
          }
          await this.roomRepo.update(rr.room_id, updateData);
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
    if (res.status?.code === 'CHECKED_OUT' || res.status?.code === 'CANCELLED') {
      throw new BadRequestException(
        'No se pueden registrar cargos adicionales en una reserva con Check-Out finalizado o cancelada.',
      );
    }
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

    const newExtras = Number(res.total_extras || 0) + total;
    const newTotal = Number(res.total_accommodation || 0) + newExtras - Number(res.total_discount || 0);
    await this.reservationRepo.update(reservationId, {
      total_extras: newExtras,
      total_amount: newTotal,
    });

    return this.findOne(reservationId);
  }

  async addPayment(
    reservationId: number,
    data: { amount: number; payment_method_id: number; reference_code?: string; notes?: string },
  ) {
    const res = await this.findOne(reservationId);
    const amount = Number(data.amount);
    if (amount <= 0) {
      throw new BadRequestException('El monto a pagar debe ser mayor a 0');
    }

    const payMethod = await this.payMethodRepo.findOne({ where: { id: data.payment_method_id } });
    if (!payMethod) {
      throw new NotFoundException('Método de pago no válido');
    }

    // Si el pago es en EFECTIVO (CASH), vincular con el turno de caja abierto
    if (payMethod.code === 'CASH') {
      const shift = await this.cashService.getCurrentShift();
      if (!shift) {
        throw new BadRequestException(
          'No se puede recibir dinero en efectivo porque no hay un turno de caja abierto en recepción. Inicie turno en el módulo de Caja.',
        );
      }
      await this.cashService.addMovement({
        shift_id: shift.id,
        user_id: shift.user_id,
        movement_type: 'INCOME',
        concept: `Cobro Reserva ${res.reservation_code} - ${res.main_guest?.first_name} ${res.main_guest?.last_name}`,
        amount: amount,
      });
    }

    const payment = this.paymentRepo.create({
      reservation_id: reservationId,
      amount,
      payment_method_id: data.payment_method_id,
      reference_code: data.reference_code || '',
      notes: data.notes || '',
    });
    await this.paymentRepo.save(payment);

    const newPaidAmount = Number(res.paid_amount || 0) + amount;
    await this.reservationRepo.update(reservationId, { paid_amount: newPaidAmount });

    return this.findOne(reservationId);
  }

  async reassignRoom(reservationId: number, oldRoomId: number, newRoomId: number) {
    const res = await this.findOne(reservationId);
    const newRoom = await this.roomRepo.findOne({
      where: { id: newRoomId },
      relations: { operational_status: true, housekeeping_status: true, room_type: true },
    });
    if (!newRoom) throw new NotFoundException('Nueva habitación no encontrada');
    if (newRoom.operational_status?.code !== 'AVAILABLE') {
      throw new BadRequestException(`La habitación ${newRoom.room_number} no está disponible`);
    }

    const resRoom = res.rooms.find((r) => r.room_id === oldRoomId);
    if (!resRoom) {
      throw new BadRequestException('La habitación especificada no pertenece a esta reserva');
    }

    resRoom.room_id = newRoomId;
    if (newRoom.room_type?.base_price) {
      resRoom.price_per_night = Number(newRoom.room_type.base_price);
    }
    await this.resRoomRepo.save(resRoom);

    // Recalcular costo total de alojamiento
    const d1 = new Date(res.check_in_date);
    const d2 = new Date(res.check_out_date);
    const nights = Math.max(1, Math.round((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)));

    const allResRooms = await this.resRoomRepo.find({ where: { reservation_id: reservationId } });
    let totalAccommodation = 0;
    for (const r of allResRooms) {
      totalAccommodation += Number(r.price_per_night) * nights;
    }
    res.total_accommodation = totalAccommodation;
    res.total_amount = totalAccommodation + Number(res.total_extras || 0) - Number(res.total_discount || 0);
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

  async applyDiscount(id: number, data: { discount_amount: number; reason?: string }) {
    const res = await this.findOne(id);
    if (res.status?.code === 'CHECKED_OUT' || res.status?.code === 'CANCELLED') {
      throw new BadRequestException(
        'No se pueden aplicar ofertas ni descuentos en una reserva con Check-Out finalizado o cancelada.',
      );
    }
    const discount = Number(data.discount_amount || 0);
    const newTotal = Math.max(0, Number(res.total_accommodation || 0) + Number(res.total_extras || 0) - discount);
    await this.reservationRepo.update(id, {
      total_discount: discount,
      total_amount: newTotal,
      notes: data.reason ? (res.notes ? `${res.notes} | Descuento: ${data.reason}` : `Descuento: ${data.reason}`) : res.notes,
    });
    return this.findOne(id);
  }
}
