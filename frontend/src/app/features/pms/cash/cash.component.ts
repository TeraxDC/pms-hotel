import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-pms-cash',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Tabs -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="dollar-sign" [size]="24" class="text-amber-600"></app-icon>
            Caja Chica, Turnos & Arqueo Ciego
          </h1>
          <p class="text-xs text-slate-500">
            Control de flujo de caja por recepcionista, ingresos, egresos y cuadre de turnos.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="activeView.set('current')"
            [ngClass]="activeView() === 'current' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Turno Actual
          </button>
          <button
            type="button"
            (click)="activeView.set('history'); loadHistory()"
            [ngClass]="activeView() === 'history' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Historial de Cierres
          </button>
        </div>
      </div>

      <!-- VIEW 1: CURRENT SHIFT -->
      <div *ngIf="activeView() === 'current'" class="space-y-6">
        
        <!-- CASE A: NO OPEN SHIFT -->
        <div *ngIf="!currentShift()" class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-8 max-w-xl mx-auto text-center space-y-4">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <app-icon name="dollar-sign" [size]="32"></app-icon>
          </div>
          <div>
            <h2 class="text-xl font-bold text-slate-900">No hay ningún turno de caja abierto</h2>
            <p class="text-xs text-slate-500 mt-1">
              Para registrar cobros de reservas o gastos de turno, debe abrir una nueva caja con el monto inicial.
            </p>
          </div>

          <div class="pt-4 space-y-4 text-left">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Monto Inicial en Efectivo (Sencillo / Cambio) *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  S/.
                </div>
                <input
                  type="number"
                  step="0.10"
                  [(ngModel)]="openShiftForm.initial_cash"
                  placeholder="100.00"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Notas de Apertura
              </label>
              <input
                type="text"
                [(ngModel)]="openShiftForm.notes"
                placeholder="Turno Mañana / Tarde"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              (click)="openShift()"
              class="w-full py-3 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <app-icon name="check-circle" [size]="18"></app-icon>
              <span>Abrir Turno de Caja</span>
            </button>
          </div>
        </div>

        <!-- CASE B: SHIFT IS OPEN -->
        <div *ngIf="currentShift()" class="space-y-6">
          
          <!-- SUMMARY METRICS CARDS -->
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Fondo Inicial</span>
              <span class="text-xl font-black text-slate-900 block mt-1">
                S/. {{ currentShift()!.initial_cash | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-0.5">Efectivo apertura</span>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-emerald-500">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Ingresos Efectivo</span>
              <span class="text-xl font-black text-emerald-600 block mt-1">
                +S/. {{ currentShift()!.total_incomes | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-0.5">Gaveta física</span>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-red-500">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Egresos Efectivo</span>
              <span class="text-xl font-black text-red-600 block mt-1">
                -S/. {{ currentShift()!.total_expenses | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-0.5">Compras & caja chica</span>
            </div>

            <div class="bg-slate-900 p-4 rounded-2xl text-white shadow-md border-l-4 border-l-amber-500">
              <span class="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">Efectivo en Gaveta</span>
              <span class="text-xl font-black text-amber-400 block mt-1">
                S/. {{ currentShift()!.expected_cash | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-0.5">Teórico a cuadrar</span>
            </div>

            <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-blue-500">
              <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Otros Medios (Digital)</span>
              <span class="text-xl font-black text-blue-600 block mt-1">
                +S/. {{ (currentShift()!.non_cash_incomes || 0) | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-0.5">Tarjetas, Yape, Bancos</span>
            </div>

            <div class="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
              <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Total Recaudado</span>
              <span class="text-xl font-black text-emerald-700 block mt-1">
                S/. {{ (currentShift()!.total_turn_sales || currentShift()!.total_incomes) | number:'1.2-2' }}
              </span>
              <span class="text-[10px] text-emerald-700 font-medium block mt-0.5">Efectivo + Medios elect.</span>
            </div>
          </div>

          <!-- DESGLOSE DE COBROS POR MÉTODO DE PAGO -->
          <div *ngIf="currentShift()!.payments_by_method && currentShift()!.payments_by_method.length > 0" class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <app-icon name="credit-card" [size]="16" class="text-amber-600"></app-icon>
                <span>Desglose de Cobros de Habitaciones por Método de Pago</span>
              </h4>
              <span class="text-[11px] text-slate-400 font-medium">Turno Activo</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                *ngFor="let pm of currentShift()!.payments_by_method"
                class="p-3 rounded-xl border flex items-center justify-between"
                [ngClass]="pm.is_cash ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950' : 'bg-blue-50/50 border-blue-200/80 text-blue-950'"
              >
                <div>
                  <span class="text-xs font-bold block">{{ pm.name }}</span>
                  <span class="text-[10px] text-slate-500">{{ pm.count }} transacci{{ pm.count === 1 ? 'ón' : 'ones' }}</span>
                </div>
                <div class="text-right">
                  <span class="font-mono font-black text-sm block" [ngClass]="pm.is_cash ? 'text-emerald-700' : 'text-blue-700'">
                    S/. {{ pm.total | number:'1.2-2' }}
                  </span>
                  <span class="text-[9px] font-bold px-1.5 py-0.2 rounded" [ngClass]="pm.is_cash ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'">
                    {{ pm.is_cash ? 'Gaveta' : 'Electrónico' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- SHIFT ACTION BUTTONS & INFO -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <app-icon name="user" [size]="18"></app-icon>
              </div>
              <div>
                <span class="text-xs font-bold text-slate-900 block">
                  Cajero: {{ currentShift()!.user?.full_name }}
                </span>
                <span class="text-[11px] text-slate-400 block">
                  Abierto desde: {{ currentShift()!.opened_at | date:'short' }}
                </span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                (click)="showMovementModal.set(true)"
                class="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <app-icon name="plus" [size]="16"></app-icon>
                Movimiento Extra
              </button>

              <button
                type="button"
                (click)="showCloseModal.set(true)"
                class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <app-icon name="check-circle" [size]="16"></app-icon>
                Cerrar Turno (Arqueo)
              </button>
            </div>
          </div>

          <!-- TABS DE DETALLE: MOVIMIENTOS VS PAGOS DE HABITACIONES -->
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
            <div class="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="shiftDetailTab.set('cash_movements')"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="shiftDetailTab() === 'cash_movements' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <app-icon name="layers" [size]="14"></app-icon>
                  <span>Movimientos en Efectivo ({{ currentShift()!.movements?.length || 0 }})</span>
                </button>
                <button
                  type="button"
                  (click)="shiftDetailTab.set('all_payments')"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  [ngClass]="shiftDetailTab() === 'all_payments' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <app-icon name="credit-card" [size]="14"></app-icon>
                  <span>Cobros de Habitaciones & Medios ({{ currentShift()!.reservation_payments?.length || 0 }})</span>
                </button>
              </div>

              <span class="text-[11px] text-slate-400 font-medium">
                {{ shiftDetailTab() === 'cash_movements' ? 'Dinero físico registrado en gaveta' : 'Historial de pagos de reservas de este turno' }}
              </span>
            </div>

            <!-- TAB 1: MOVIMIENTOS EN EFECTIVO -->
            <div *ngIf="shiftDetailTab() === 'cash_movements'" class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th class="px-6 py-3">Hora</th>
                    <th class="px-6 py-3">Tipo</th>
                    <th class="px-6 py-3">Concepto</th>
                    <th class="px-6 py-3">Registrado Por</th>
                    <th class="px-6 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let m of currentShift()!.movements" class="hover:bg-slate-50/80">
                    <td class="px-6 py-3.5 font-medium text-slate-500">{{ m.created_at | date:'HH:mm:ss' }}</td>
                    <td class="px-6 py-3.5">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
                        [ngClass]="m.movement_type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'"
                      >
                        {{ m.movement_type === 'INCOME' ? 'Ingreso Efectivo' : 'Egreso Efectivo' }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 font-medium text-slate-800">{{ m.concept }}</td>
                    <td class="px-6 py-3.5 text-slate-500">{{ m.user?.full_name || 'Cajero' }}</td>
                    <td class="px-6 py-3.5 text-right font-bold" [ngClass]="m.movement_type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'">
                      {{ m.movement_type === 'INCOME' ? '+' : '-' }}S/. {{ m.amount | number:'1.2-2' }}
                    </td>
                  </tr>

                  <tr *ngIf="!currentShift()!.movements || currentShift()!.movements.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                      No se han registrado movimientos extraordinarios de efectivo en este turno
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- TAB 2: COBROS DE HABITACIONES (TODOS LOS MEDIOS) -->
            <div *ngIf="shiftDetailTab() === 'all_payments'" class="overflow-x-auto">
              <table class="w-full text-left text-xs text-slate-600">
                <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th class="px-6 py-3">Hora</th>
                    <th class="px-6 py-3">Reserva / Huésped</th>
                    <th class="px-6 py-3">Habitación(es)</th>
                    <th class="px-6 py-3">Método de Pago</th>
                    <th class="px-6 py-3">N° Voucher / Ref</th>
                    <th class="px-6 py-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngFor="let p of currentShift()!.reservation_payments" class="hover:bg-slate-50/80">
                    <td class="px-6 py-3.5 font-medium text-slate-500">{{ p.paid_at | date:'HH:mm:ss' }}</td>
                    <td class="px-6 py-3.5">
                      <span class="font-bold text-slate-900 block">{{ p.guest_name }}</span>
                      <span class="text-[10px] text-slate-400 font-mono">{{ p.reservation_code }}</span>
                    </td>
                    <td class="px-6 py-3.5 text-slate-700 font-medium">
                      {{ p.room_numbers ? 'Hab. ' + p.room_numbers : 'Sin hab.' }}
                    </td>
                    <td class="px-6 py-3.5">
                      <span
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1"
                        [ngClass]="p.is_cash ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'"
                      >
                        <app-icon [name]="p.is_cash ? 'check-circle' : 'credit-card'" [size]="12"></app-icon>
                        {{ p.payment_method_name }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 font-mono text-slate-500 text-[11px]">
                      {{ p.reference_code || '-' }}
                    </td>
                    <td class="px-6 py-3.5 text-right font-bold" [ngClass]="p.is_cash ? 'text-emerald-600' : 'text-blue-600'">
                      +S/. {{ p.amount | number:'1.2-2' }}
                    </td>
                  </tr>

                  <tr *ngIf="!currentShift()!.reservation_payments || currentShift()!.reservation_payments.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-slate-400">
                      No se han registrado cobros de reservas durante este turno
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      <!-- VIEW 2: SHIFTS HISTORY -->
      <div *ngIf="activeView() === 'history'" class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-6 py-4">ID Turno</th>
                <th class="px-6 py-4">Cajero</th>
                <th class="px-6 py-4">Apertura</th>
                <th class="px-6 py-4">Cierre</th>
                <th class="px-6 py-4">Otros Medios (Digital)</th>
                <th class="px-6 py-4">Ventas Totales</th>
                <th class="px-6 py-4">Gaveta Esperada</th>
                <th class="px-6 py-4">Contado (Físico)</th>
                <th class="px-6 py-4 text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let s of historyList()" class="hover:bg-slate-50/80">
                <td class="px-6 py-4 font-mono font-bold text-slate-900">#{{ s.id }}</td>
                <td class="px-6 py-4 font-semibold text-slate-800">{{ s.user?.full_name }}</td>
                <td class="px-6 py-4 text-slate-500">{{ s.opened_at | date:'short' }}</td>
                <td class="px-6 py-4 text-slate-500">{{ s.closed_at ? (s.closed_at | date:'short') : 'Abierto' }}</td>
                <td class="px-6 py-4 font-medium text-blue-700">
                  +S/. {{ (s.non_cash_incomes || 0) | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 font-black text-slate-900">
                  S/. {{ (s.total_turn_sales || s.total_incomes) | number:'1.2-2' }}
                </td>
                <td class="px-6 py-4 font-bold text-slate-900">S/. {{ s.expected_cash | number:'1.2-2' }}</td>
                <td class="px-6 py-4 font-bold text-slate-900">{{ s.actual_cash !== null ? ('S/. ' + (s.actual_cash | number:'1.2-2')) : '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <span
                    class="font-bold px-2 py-1 rounded-md text-xs font-mono"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700': s.difference == 0,
                      'bg-red-50 text-red-700': s.difference < 0,
                      'bg-blue-50 text-blue-700': s.difference > 0
                    }"
                  >
                    {{ s.difference > 0 ? '+' : '' }}S/. {{ s.difference !== null ? (s.difference | number:'1.2-2') : '0.00' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL REGISTRAR MOVIMIENTO -->
      <div
        *ngIf="showMovementModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900">Registrar Movimiento de Caja</h3>
            <button (click)="showMovementModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveMovement()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tipo</label>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="movementForm.movement_type = 'INCOME'"
                  [ngClass]="movementForm.movement_type === 'INCOME' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-100 text-slate-700'"
                  class="py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Ingreso Extra
                </button>
                <button
                  type="button"
                  (click)="movementForm.movement_type = 'EXPENSE'"
                  [ngClass]="movementForm.movement_type === 'EXPENSE' ? 'bg-red-600 text-white font-bold' : 'bg-slate-100 text-slate-700'"
                  class="py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Egreso / Gasto
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Concepto *</label>
              <input
                type="text"
                [(ngModel)]="movementForm.concept"
                name="concept"
                required
                placeholder="Ej. Compra de agua embotellada / Pago taxi"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Monto en Efectivo *</label>
              <input
                type="number"
                step="0.50"
                [(ngModel)]="movementForm.amount"
                name="amount"
                required
                placeholder="20.00"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showMovementModal.set(false)"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Guardar Movimiento
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- MODAL CIERRE DE TURNO (ARQUEO & CUADRE DE CAJA) -->
      <div
        *ngIf="showCloseModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                <app-icon name="dollar-sign" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900 leading-tight">Arqueo de Efectivo & Cierre de Turno</h3>
                <p class="text-xs text-slate-400">Verifique el dinero físico en gaveta frente al saldo teórico</p>
              </div>
            </div>
            <button (click)="showCloseModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Resumen Teórico del Sistema (Efectivo Físico + Medios Electrónicos) -->
            <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2.5">
              <div class="flex items-center justify-between font-bold text-slate-700">
                <span class="flex items-center gap-1.5 text-slate-800">
                  <app-icon name="layers" [size]="14" class="text-amber-600"></app-icon>
                  Saldo Teórico Físico en Gaveta (A Cuadrar)
                </span>
                <span class="font-mono text-slate-950 font-black text-sm">
                  S/. {{ currentShift()!.expected_cash | number:'1.2-2' }}
                </span>
              </div>

              <!-- Desglose Físico: Inicial + Ingresos Efectivo - Egresos Efectivo -->
              <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Fondo Inicial</span>
                  <span class="font-bold text-slate-800">S/. {{ currentShift()!.initial_cash | number:'1.2-2' }}</span>
                </div>
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Ingresos Efectivo</span>
                  <span class="font-bold text-emerald-600">+S/. {{ currentShift()!.total_incomes | number:'1.2-2' }}</span>
                </div>
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Egresos Efectivo</span>
                  <span class="font-bold text-red-600">-S/. {{ currentShift()!.total_expenses | number:'1.2-2' }}</span>
                </div>
              </div>

              <!-- Desglose de Otros Medios de Pago Electrónicos / Digitales -->
              <div class="pt-2 border-t border-slate-200/60">
                <div class="flex items-center justify-between text-[11px] font-bold mb-1.5">
                  <span class="flex items-center gap-1 text-slate-700">
                    <app-icon name="credit-card" [size]="13" class="text-blue-600"></app-icon>
                    Cobros por Otros Medios (Bancos / Digital)
                  </span>
                  <span class="font-mono text-blue-700 font-bold">
                    +S/. {{ (currentShift()!.non_cash_incomes || 0) | number:'1.2-2' }}
                  </span>
                </div>

                <div *ngIf="currentShift()!.payments_by_method && currentShift()!.payments_by_method.length > 0" class="flex flex-wrap gap-1.5 pt-0.5">
                  <div
                    *ngFor="let pm of currentShift()!.payments_by_method"
                    class="px-2 py-1 bg-white rounded-lg border border-slate-200 text-[10px] flex items-center gap-1.5 font-medium shadow-2xs"
                  >
                    <span class="font-bold text-slate-700">{{ pm.name }}:</span>
                    <span class="font-mono font-bold" [ngClass]="pm.is_cash ? 'text-emerald-700' : 'text-blue-700'">
                      S/. {{ pm.total | number:'1.2-2' }}
                    </span>
                    <span class="text-slate-400 text-[9px]">({{ pm.count }})</span>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-2 mt-1.5 border-t border-slate-200/60 text-[11px]">
                  <span class="font-bold text-slate-800">Recaudación Total del Turno:</span>
                  <span class="font-mono font-black text-slate-900">
                    S/. {{ (currentShift()!.total_turn_sales || currentShift()!.total_incomes) | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Entrada de Efectivo Físico Contado -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Efectivo Físico Contado en Gaveta *</span>
                <span class="text-[10px] text-slate-400 font-normal">Billetes y monedas reales</span>
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-sm">
                  S/.
                </div>
                <input
                  type="number"
                  step="0.10"
                  [(ngModel)]="closeShiftForm.actual_cash"
                  placeholder="0.00"
                  class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <!-- PANEL INDICADOR DE LA DIFERENCIA (DÓNDE ESTÁ EL DESCUADRE) -->
            <div *ngIf="closingDifference !== null" class="animate-in fade-in duration-150">
              
              <!-- CASO A: FALTANTE EN EFECTIVO -->
              <div
                *ngIf="closingDifference < 0"
                class="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950 space-y-2 shadow-2xs"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-black text-red-700">
                    <app-icon name="alert-triangle" [size]="18" class="text-red-600"></app-icon>
                    <span>FALTANTE EN EFECTIVO FÍSICO</span>
                  </div>
                  <span class="font-mono font-black text-base text-red-600 bg-red-100/90 px-2.5 py-0.5 rounded-lg border border-red-200">
                    -S/. {{ abs(closingDifference) | number:'1.2-2' }}
                  </span>
                </div>

                <div class="text-[11px] text-red-900 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>¿Dónde está la diferencia?</strong> En la gaveta física faltan <strong>S/. {{ abs(closingDifference) | number:'1.2-2' }}</strong> respecto a los registros del sistema.
                  </p>
                  <div class="grid grid-cols-2 gap-2 p-2.5 bg-white/90 rounded-xl border border-red-100 font-mono text-[11px] text-slate-700">
                    <div>• Saldo Esperado: <strong class="text-slate-900">S/. {{ currentShift()!.expected_cash }}</strong></div>
                    <div>• Dinero Contado: <strong class="text-red-700">S/. {{ closeShiftForm.actual_cash }}</strong></div>
                  </div>
                  <p class="text-[10px] text-red-800 italic pt-0.5">
                    Posibles causas: Gasto menor no registrado como egreso, vuelto excedente entregado por error o error en el conteo de billetes/monedas.
                  </p>
                </div>
              </div>

              <!-- CASO B: SOBRANTE EN EFECTIVO -->
              <div
                *ngIf="closingDifference > 0"
                class="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2 shadow-2xs"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-black text-amber-800">
                    <app-icon name="info" [size]="18" class="text-amber-600"></app-icon>
                    <span>SOBRANTE EN EFECTIVO FÍSICO</span>
                  </div>
                  <span class="font-mono font-black text-base text-amber-700 bg-amber-100/90 px-2.5 py-0.5 rounded-lg border border-amber-200">
                    +S/. {{ closingDifference | number:'1.2-2' }}
                  </span>
                </div>

                <div class="text-[11px] text-amber-900 space-y-1.5 leading-relaxed">
                  <p>
                    <strong>¿Dónde está la diferencia?</strong> En la gaveta física sobran <strong>S/. {{ closingDifference | number:'1.2-2' }}</strong> por encima del saldo teórico registrado en el sistema.
                  </p>
                  <div class="grid grid-cols-2 gap-2 p-2.5 bg-white/90 rounded-xl border border-amber-100 font-mono text-[11px] text-slate-700">
                    <div>• Saldo Esperado: <strong class="text-slate-900">S/. {{ currentShift()!.expected_cash }}</strong></div>
                    <div>• Dinero Contado: <strong class="text-amber-800">S/. {{ closeShiftForm.actual_cash }}</strong></div>
                  </div>
                  <p class="text-[10px] text-amber-800 italic pt-0.5">
                    Posibles causas: Cobro en efectivo no registrado en el sistema, propina dejada en gaveta o fondo inicial mayor al registrado.
                  </p>
                </div>
              </div>

              <!-- CASO C: CUADRE EXACTO -->
              <div
                *ngIf="closingDifference === 0"
                class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1 shadow-2xs"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2 font-black text-emerald-700">
                    <app-icon name="check-circle" [size]="18" class="text-emerald-600"></app-icon>
                    <span>CUADRE EXACTO DE TURNO</span>
                  </div>
                  <span class="font-mono font-black text-base text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    S/. 0.00
                  </span>
                </div>
                <p class="text-[11px] text-emerald-800">
                  El dinero físico contado coincide al 100% con el saldo teórico de <strong>S/. {{ currentShift()!.expected_cash }}</strong>. La caja está perfectamente cuadrada.
                </p>
              </div>

            </div>

            <!-- Observaciones del Cierre -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Observaciones del Cierre</span>
                <span *ngIf="closingDifference !== null && closingDifference !== 0" class="text-[10px] text-amber-700 font-bold">
                  Recomendado para justificar descuadre
                </span>
              </label>
              <textarea
                [(ngModel)]="closeShiftForm.notes"
                rows="2"
                placeholder="Comentarios adicionales, motivo del descuadre o detalle del arqueo..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              ></textarea>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              (click)="showCloseModal.set(false)"
              class="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="executeCloseShift()"
              [disabled]="closeShiftForm.actual_cash === null"
              class="px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              [ngClass]="closingDifference !== null && closingDifference !== 0
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20'
                : 'bg-red-600 hover:bg-red-500 shadow-red-600/20'"
            >
              <app-icon name="check-circle" [size]="16"></app-icon>
              <span>{{ closingDifference !== null && closingDifference !== 0 ? 'Revisar y Cerrar con Diferencia' : 'Confirmar Cierre de Turno' }}</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CashComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  activeView = signal<'current' | 'history'>('current');
  currentShift = signal<any | null>(null);
  historyList = signal<any[]>([]);
  shiftDetailTab = signal<'cash_movements' | 'all_payments'>('cash_movements');

  showMovementModal = signal<boolean>(false);
  showCloseModal = signal<boolean>(false);

  openShiftForm = {
    initial_cash: 100,
    notes: ''
  };

  movementForm = {
    movement_type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    concept: '',
    amount: null
  };

  closeShiftForm = {
    actual_cash: null,
    notes: ''
  };

  ngOnInit() {
    this.loadCurrentShift();
  }

  loadCurrentShift() {
    this.api.get<any>('cash/current').subscribe({
      next: (data) => this.currentShift.set(data),
      error: () => this.toast.error('No se pudo verificar el estado de la caja')
    });
  }

  loadHistory() {
    this.api.get<any[]>('cash/history').subscribe({
      next: (data) => this.historyList.set(data),
      error: () => this.toast.error('No se pudo cargar el historial de cajas')
    });
  }

  openShift() {
    const user = this.auth.currentUser();
    const userId = user?.id || 1;

    this.api.post('cash/open', {
      user_id: userId,
      initial_cash: this.openShiftForm.initial_cash,
      notes: this.openShiftForm.notes
    }).subscribe({
      next: () => {
        this.toast.success('Turno de caja abierto exitosamente');
        this.loadCurrentShift();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al abrir caja')
    });
  }

  saveMovement() {
    const shift = this.currentShift();
    const user = this.auth.currentUser();
    if (!shift || !this.movementForm.concept || !this.movementForm.amount) {
      this.toast.warning('Complete todos los campos del movimiento');
      return;
    }

    this.api.post('cash/movements', {
      shift_id: shift.id,
      user_id: user?.id || 1,
      movement_type: this.movementForm.movement_type,
      concept: this.movementForm.concept,
      amount: this.movementForm.amount
    }).subscribe({
      next: () => {
        this.toast.success('Movimiento registrado en caja');
        this.showMovementModal.set(false);
        this.movementForm = { movement_type: 'EXPENSE', concept: '', amount: null };
        this.loadCurrentShift();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al registrar movimiento')
    });
  }

  get closingDifference(): number | null {
    if (
      this.closeShiftForm.actual_cash === null ||
      this.closeShiftForm.actual_cash === undefined ||
      (this.closeShiftForm.actual_cash as any) === ''
    ) {
      return null;
    }
    const expected = Number(this.currentShift()?.expected_cash || 0);
    const actual = Number(this.closeShiftForm.actual_cash);
    return Number((actual - expected).toFixed(2));
  }

  abs(val: number | null): number {
    return Math.abs(val || 0);
  }

  async executeCloseShift() {
    const shift = this.currentShift();
    if (
      !shift ||
      this.closeShiftForm.actual_cash === null ||
      this.closeShiftForm.actual_cash === undefined ||
      (this.closeShiftForm.actual_cash as any) === ''
    ) {
      this.toast.warning('Ingrese el monto físico contado en caja');
      return;
    }

    const expected = Number(shift.expected_cash || 0);
    const actual = Number(this.closeShiftForm.actual_cash);
    const diff = Number((actual - expected).toFixed(2));
    const absDiff = Math.abs(diff).toFixed(2);
    const nonCash = Number(shift.non_cash_incomes || 0);
    const totalSales = Number(shift.total_turn_sales || shift.total_incomes || 0);

    const electronicSummary = nonCash > 0
      ? `• Cobros por otros medios (Tarjeta/Yape/Transferencia): S/. ${nonCash.toFixed(2)}\n• Recaudación global del turno: S/. ${totalSales.toFixed(2)}\n\n`
      : '';

    let confirmTitle = 'Confirmar Cierre de Turno';
    let confirmType: 'info' | 'warning' | 'danger' = 'info';
    let confirmMessage = '';
    let confirmBtnText = 'Sí, Cerrar Turno';

    if (diff < 0) {
      confirmTitle = `Descuadre: FALTANTE de S/. ${absDiff}`;
      confirmType = 'danger';
      confirmBtnText = 'Sí, Cerrar con Faltante';
      confirmMessage =
        `Se ha detectado un FALTANTE en el arqueo físico de caja:\n\n` +
        `• Saldo Teórico Esperado (Gaveta): S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Físico Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia en Contra: -S/. ${absDiff}\n\n` +
        electronicSummary +
        `En la gaveta física falta dinero en comparación con las operaciones registradas en el sistema.\n\n` +
        `¿Desea confirmar el cierre del turno activo con este faltante?`;
    } else if (diff > 0) {
      confirmTitle = `Descuadre: SOBRANTE de S/. ${absDiff}`;
      confirmType = 'warning';
      confirmBtnText = 'Sí, Cerrar con Sobrante';
      confirmMessage =
        `Se ha detectado un SOBRANTE en el arqueo físico de caja:\n\n` +
        `• Saldo Teórico Esperado (Gaveta): S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Físico Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia a Favor: +S/. ${absDiff}\n\n` +
        electronicSummary +
        `En la gaveta física hay más dinero del registrado en el sistema.\n\n` +
        `¿Desea confirmar el cierre del turno activo con este sobrante?`;
    } else {
      confirmTitle = 'Cierre de Turno Cuadrado';
      confirmType = 'info';
      confirmBtnText = 'Sí, Cerrar Turno';
      confirmMessage =
        `El arqueo físico de caja coincide exactamente con el sistema:\n\n` +
        `• Saldo Esperado en Gaveta: S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia: S/. 0.00\n\n` +
        electronicSummary +
        `¿Desea confirmar el cierre del turno activo?`;
    }

    const confirmed = await this.dialog.confirm({
      title: confirmTitle,
      message: confirmMessage,
      type: confirmType,
      confirmText: confirmBtnText,
      cancelText: 'Cancelar y Recontar'
    });

    if (!confirmed) {
      return;
    }

    this.api.post('cash/close', {
      shift_id: shift.id,
      actual_cash: actual,
      notes: this.closeShiftForm.notes
    }).subscribe({
      next: async (closed: any) => {
        this.showCloseModal.set(false);
        this.closeShiftForm = { actual_cash: null, notes: '' };

        if (diff < 0) {
          this.toast.warning(`Turno cerrado con faltante registrado de S/. ${absDiff}`);
        } else if (diff > 0) {
          this.toast.info(`Turno cerrado con sobrante registrado de S/. ${absDiff}`);
        } else {
          this.toast.success('Turno de caja cerrado exitosamente con cuadre exacto');
        }

        this.loadCurrentShift();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al cerrar caja')
    });
  }
}
