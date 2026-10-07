import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { Reservation } from '../reservations/entities/reservation.entity';
import { CashShift } from '../cash/entities/cash-shift.entity';
import { CashMovement } from '../cash/entities/cash-movement.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>,
    @InjectRepository(Reservation)
    private readonly reservationRepo: Repository<Reservation>,
    @InjectRepository(CashShift)
    private readonly shiftRepo: Repository<CashShift>,
    @InjectRepository(CashMovement)
    private readonly movementRepo: Repository<CashMovement>,
  ) {}

  async getKpis(startDate?: string, endDate?: string) {
    const rooms = await this.roomRepo.find({
      relations: { operational_status: true, housekeeping_status: true, room_type: true },
    });

    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r) => r.operational_status?.code === 'OCCUPIED').length;
    const availableRooms = rooms.filter((r) => r.operational_status?.code === 'AVAILABLE').length;
    const maintenanceRooms = rooms.filter((r) => r.operational_status?.code === 'MAINTENANCE').length;
    const dirtyRooms = rooms.filter((r) => r.housekeeping_status?.code === 'DIRTY').length;
    const cleanRooms = rooms.filter((r) => r.housekeeping_status?.code === 'CLEAN').length;
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    const where: any = {};
    if (startDate && endDate) {
      where.check_in_date = Between(startDate, endDate);
    }

    const reservations = await this.reservationRepo.find({
      where,
      relations: {
        status: true,
        main_guest: true,
        rooms: { room: { room_type: true } },
        extra_charges: true,
        payments: { payment_method: true },
      },
      order: { created_at: 'DESC' },
    });

    let totalAccommodation = 0;
    let totalExtras = 0;
    let totalPaid = 0;
    let totalAmount = 0;

    for (const res of reservations) {
      totalAccommodation += Number(res.total_accommodation || 0);
      totalExtras += Number(res.total_extras || 0);
      totalPaid += Number(res.paid_amount || 0);
      totalAmount += Number(res.total_amount || 0);
    }

    const pendingBalance = Math.max(0, totalAmount - totalPaid);

    const roomPerformance = rooms.map((room) => {
      const roomRes = reservations.filter((res) =>
        res.rooms?.some((rr) => rr.room_id === room.id),
      );
      const roomRevenue = roomRes.reduce(
        (acc, curr) => acc + Number(curr.total_accommodation || 0),
        0,
      );
      return {
        room_id: room.id,
        room_number: room.room_number,
        floor: room.floor,
        room_type: room.room_type?.name,
        base_price: room.room_type?.base_price,
        operational_status: room.operational_status?.name,
        housekeeping_status: room.housekeeping_status?.name,
        total_bookings: roomRes.length,
        total_revenue: roomRevenue,
      };
    });

    return {
      occupancy: {
        total_rooms: totalRooms,
        occupied_rooms: occupiedRooms,
        available_rooms: availableRooms,
        maintenance_rooms: maintenanceRooms,
        dirty_rooms: dirtyRooms,
        clean_rooms: cleanRooms,
        occupancy_rate: occupancyRate,
      },
      financials: {
        total_accommodation: totalAccommodation,
        total_extras: totalExtras,
        total_amount: totalAmount,
        total_paid: totalPaid,
        pending_balance: pendingBalance,
      },
      reservations_count: {
        total: reservations.length,
        checked_in: reservations.filter((r) => r.status?.code === 'CHECKED_IN').length,
        confirmed: reservations.filter((r) => r.status?.code === 'CONFIRMED').length,
        checked_out: reservations.filter((r) => r.status?.code === 'CHECKED_OUT').length,
        walk_ins: reservations.filter((r) => r.reservation_code?.startsWith('WLK')).length,
      },
      room_performance: roomPerformance,
      reservations: reservations.map((r) => ({
        id: r.id,
        code: r.reservation_code,
        guest_name: `${r.main_guest?.first_name || ''} ${r.main_guest?.last_name || ''}`,
        guest_doc: r.main_guest?.document_number,
        check_in: r.check_in_date,
        check_out: r.check_out_date,
        status: r.status?.name,
        total_amount: r.total_amount,
        paid_amount: r.paid_amount,
        pending_amount: Math.max(0, Number(r.total_amount || 0) - Number(r.paid_amount || 0)),
        rooms: r.rooms?.map((rr) => `Hab. ${rr.room?.room_number}`).join(', '),
      })),
    };
  }

  async getCashReport() {
    const shifts = await this.shiftRepo.find({
      relations: { user: true, movements: { user: true } },
      order: { opened_at: 'DESC' },
      take: 50,
    });

    const movements = await this.movementRepo.find({
      relations: { user: true, shift: true },
      order: { created_at: 'DESC' },
      take: 100,
    });

    return {
      shifts: shifts.map((s) => ({
        id: s.id,
        user_name: s.user?.full_name,
        status: s.status,
        initial_cash: s.initial_cash,
        total_incomes: s.total_incomes,
        total_expenses: s.total_expenses,
        expected_cash: s.expected_cash,
        actual_cash: s.actual_cash,
        difference: s.difference,
        opened_at: s.opened_at,
        closed_at: s.closed_at,
        notes: s.notes,
        movements_count: s.movements?.length || 0,
      })),
      movements: movements.map((m) => ({
        id: m.id,
        shift_id: m.shift_id,
        user_name: m.user?.full_name,
        movement_type: m.movement_type,
        concept: m.concept,
        amount: m.amount,
        created_at: m.created_at,
      })),
    };
  }
}
