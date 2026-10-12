import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashShift } from './entities/cash-shift.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { User } from '../users/entities/user.entity';
import { Payment } from '../reservations/entities/payment.entity';

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(CashShift)
    private readonly shiftRepo: Repository<CashShift>,
    @InjectRepository(CashMovement)
    private readonly movementRepo: Repository<CashMovement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  async getShiftPayments(shift: CashShift): Promise<Payment[]> {
    const qb = this.paymentRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.payment_method', 'pm')
      .leftJoinAndSelect('p.reservation', 'res')
      .leftJoinAndSelect('res.main_guest', 'guest')
      .leftJoinAndSelect('res.rooms', 'res_rooms')
      .leftJoinAndSelect('res_rooms.room', 'room')
      .leftJoinAndSelect('p.received_by', 'user');

    if (shift.closed_at) {
      qb.where(
        '(p.shift_id = :shiftId OR (p.shift_id IS NULL AND p.paid_at >= :openedAt AND p.paid_at <= :closedAt))',
        { shiftId: shift.id, openedAt: shift.opened_at, closedAt: shift.closed_at },
      );
    } else {
      qb.where(
        '(p.shift_id = :shiftId OR (p.shift_id IS NULL AND p.paid_at >= :openedAt))',
        { shiftId: shift.id, openedAt: shift.opened_at },
      );
    }

    qb.orderBy('p.paid_at', 'DESC');
    return qb.getMany();
  }

  async enrichShiftWithPayments(shift: CashShift): Promise<any> {
    if (!shift) return null;
    const payments = await this.getShiftPayments(shift);

    let nonCashTotal = 0;
    let roomCashTotal = 0;
    const methodMap = new Map<string, any>();

    for (const p of payments) {
      const amount = Number(p.amount || 0);
      const isCash = p.payment_method?.code === 'CASH';

      if (isCash) {
        roomCashTotal += amount;
      } else {
        nonCashTotal += amount;
      }

      const methodKey = p.payment_method?.code || 'OTHER';
      if (!methodMap.has(methodKey)) {
        methodMap.set(methodKey, {
          code: methodKey,
          name: p.payment_method?.name || 'Otro Medio',
          icon_name: p.payment_method?.icon_name || 'credit-card',
          is_cash: isCash,
          total: 0,
          count: 0,
          transactions: [],
        });
      }

      const m = methodMap.get(methodKey);
      m.total = Number((m.total + amount).toFixed(2));
      m.count += 1;
      m.transactions.push({
        id: p.id,
        amount: amount,
        paid_at: p.paid_at,
        reference_code: p.reference_code,
        notes: p.notes,
        reservation_id: p.reservation_id,
        reservation_code: p.reservation?.reservation_code || `#RES-${p.reservation_id}`,
        guest_name: `${p.reservation?.main_guest?.first_name || ''} ${p.reservation?.main_guest?.last_name || ''}`.trim() || 'Huésped',
        rooms: p.reservation?.rooms?.map((r) => r.room?.room_number).filter(Boolean).join(', ') || '',
      });
    }

    const cashIncomes = Number(shift.total_incomes || 0);
    const cashExpenses = Number(shift.total_expenses || 0);
    const expectedCash = Number(shift.expected_cash || 0);
    const nonCashIncomes = Number(nonCashTotal.toFixed(2));
    const totalTurnSales = Number((cashIncomes + nonCashIncomes).toFixed(2));
    const totalTheoreticalBalance = Number((expectedCash + nonCashIncomes).toFixed(2));

    return {
      ...shift,
      initial_cash: Number(shift.initial_cash || 0),
      total_incomes: cashIncomes,
      total_expenses: cashExpenses,
      expected_cash: expectedCash,
      actual_cash: shift.actual_cash !== null ? Number(shift.actual_cash) : null,
      difference: shift.difference !== null ? Number(shift.difference) : null,
      non_cash_incomes: nonCashIncomes,
      room_cash_incomes: Number(roomCashTotal.toFixed(2)),
      total_turn_sales: totalTurnSales,
      total_theoretical_balance: totalTheoreticalBalance,
      payments_by_method: Array.from(methodMap.values()),
      reservation_payments: payments.map((p) => ({
        id: p.id,
        amount: Number(p.amount),
        paid_at: p.paid_at,
        reference_code: p.reference_code,
        notes: p.notes,
        payment_method_id: p.payment_method_id,
        payment_method_name: p.payment_method?.name || 'Pago',
        payment_method_code: p.payment_method?.code || 'OTHER',
        is_cash: p.payment_method?.code === 'CASH',
        reservation_id: p.reservation_id,
        reservation_code: p.reservation?.reservation_code,
        guest_name: `${p.reservation?.main_guest?.first_name || ''} ${p.reservation?.main_guest?.last_name || ''}`.trim(),
        room_numbers: p.reservation?.rooms?.map((r) => r.room?.room_number).filter(Boolean).join(', ') || '',
      })),
    };
  }

  async getCurrentShift() {
    const shift = await this.shiftRepo.findOne({
      where: { status: 'OPEN' },
      relations: { user: true, movements: { user: true } },
      order: { opened_at: 'DESC' },
    });
    if (!shift) return null;
    return this.enrichShiftWithPayments(shift);
  }

  async openShift(userId: number, initialCash: number, notes?: string) {
    const existing = await this.shiftRepo.findOne({ where: { status: 'OPEN' } });
    if (existing) {
      throw new BadRequestException('Ya existe un turno de caja abierto en el sistema. Debe cerrarlo antes de iniciar otro.');
    }

    const shift = this.shiftRepo.create({
      user_id: userId,
      initial_cash: Number(initialCash || 0),
      total_incomes: 0,
      total_expenses: 0,
      expected_cash: Number(initialCash || 0),
      status: 'OPEN',
      notes: notes || '',
    });

    const saved = await this.shiftRepo.save(shift);
    return this.enrichShiftWithPayments(saved);
  }

  async addMovement(data: {
    shift_id: number;
    user_id: number;
    movement_type: 'INCOME' | 'EXPENSE';
    concept: string;
    amount: number;
  }) {
    const shift = await this.shiftRepo.findOne({ where: { id: data.shift_id, status: 'OPEN' } });
    if (!shift) throw new NotFoundException('No se encontró un turno abierto con este ID');

    const movement = this.movementRepo.create({
      shift_id: data.shift_id,
      user_id: data.user_id,
      movement_type: data.movement_type,
      concept: data.concept,
      amount: Number(data.amount),
    });
    await this.movementRepo.save(movement);

    if (data.movement_type === 'INCOME') {
      shift.total_incomes = Number(shift.total_incomes || 0) + Number(data.amount);
      shift.expected_cash = Number(shift.expected_cash || 0) + Number(data.amount);
    } else {
      shift.total_expenses = Number(shift.total_expenses || 0) + Number(data.amount);
      shift.expected_cash = Number(shift.expected_cash || 0) - Number(data.amount);
    }

    await this.shiftRepo.save(shift);
    return this.getCurrentShift();
  }

  async closeShift(data: { shift_id: number; actual_cash: number; notes?: string }) {
    const shift = await this.shiftRepo.findOne({ where: { id: data.shift_id, status: 'OPEN' } });
    if (!shift) throw new NotFoundException('El turno de caja no se encuentra abierto o no existe');

    const actual = Number(data.actual_cash);
    const expected = Number(shift.expected_cash);
    const difference = actual - expected;

    shift.actual_cash = actual;
    shift.difference = difference;
    shift.status = 'CLOSED';
    shift.closed_at = new Date();
    if (data.notes) {
      shift.notes = shift.notes ? `${shift.notes} | Cierre: ${data.notes}` : data.notes;
    }

    await this.shiftRepo.save(shift);

    const closed = await this.shiftRepo.findOne({
      where: { id: shift.id },
      relations: { user: true, movements: true },
    });
    return this.enrichShiftWithPayments(closed!);
  }

  async getHistory() {
    const shifts = await this.shiftRepo.find({
      relations: { user: true, movements: true },
      order: { opened_at: 'DESC' },
      take: 20,
    });
    return Promise.all(shifts.map((s) => this.enrichShiftWithPayments(s)));
  }
}
