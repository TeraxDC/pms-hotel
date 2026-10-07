import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CashShift } from './entities/cash-shift.entity';
import { CashMovement } from './entities/cash-movement.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CashService {
  constructor(
    @InjectRepository(CashShift)
    private readonly shiftRepo: Repository<CashShift>,
    @InjectRepository(CashMovement)
    private readonly movementRepo: Repository<CashMovement>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getCurrentShift() {
    const shift = await this.shiftRepo.findOne({
      where: { status: 'OPEN' },
      relations: { user: true, movements: { user: true } },
      order: { opened_at: 'DESC' },
    });
    return shift;
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

    return this.shiftRepo.save(shift);
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

    return this.shiftRepo.findOne({
      where: { id: shift.id },
      relations: { user: true, movements: true },
    });
  }

  async getHistory() {
    return this.shiftRepo.find({
      relations: { user: true, movements: true },
      order: { opened_at: 'DESC' },
      take: 20,
    });
  }
}
