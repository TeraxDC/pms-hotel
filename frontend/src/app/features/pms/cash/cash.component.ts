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
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Monto Inicial</span>
              <span class="text-2xl font-black text-slate-900 block mt-1">
                S/. {{ currentShift()!.initial_cash }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Apertura de turno</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-emerald-500">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Ingresos</span>
              <span class="text-2xl font-black text-emerald-600 block mt-1">
                +S/. {{ currentShift()!.total_incomes }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Hospedaje & extras</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-red-500">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Egresos</span>
              <span class="text-2xl font-black text-red-600 block mt-1">
                -S/. {{ currentShift()!.total_expenses }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Compras & gastos menores</span>
            </div>

            <div class="bg-slate-900 p-5 rounded-2xl text-white shadow-md">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Efectivo en Caja</span>
              <span class="text-2xl font-black text-amber-400 block mt-1">
                S/. {{ currentShift()!.expected_cash }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Saldo teórico actual</span>
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

          <!-- MOVEMENTS TABLE -->
          <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
            <div class="p-5 border-b border-slate-100">
              <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Movimientos del Turno en Efectivo
              </h3>
            </div>

            <div class="overflow-x-auto">
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
                        {{ m.movement_type === 'INCOME' ? 'Ingreso' : 'Egreso' }}
                      </span>
                    </td>
                    <td class="px-6 py-3.5 font-medium text-slate-800">{{ m.concept }}</td>
                    <td class="px-6 py-3.5 text-slate-500">{{ m.user?.full_name || 'Cajero' }}</td>
                    <td class="px-6 py-3.5 text-right font-bold" [ngClass]="m.movement_type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'">
                      {{ m.movement_type === 'INCOME' ? '+' : '-' }}S/. {{ m.amount }}
                    </td>
                  </tr>

                  <tr *ngIf="!currentShift()!.movements || currentShift()!.movements.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-slate-400">
                      No se han registrado movimientos extraordinarios en este turno
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
                <th class="px-6 py-4">Esperado</th>
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
                <td class="px-6 py-4 font-bold text-slate-900">S/. {{ s.expected_cash }}</td>
                <td class="px-6 py-4 font-bold text-slate-900">{{ s.actual_cash !== null ? 'S/. ' + s.actual_cash : '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <span
                    class="font-bold px-2 py-1 rounded-md text-xs"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700': s.difference == 0,
                      'bg-red-50 text-red-700': s.difference < 0,
                      'bg-blue-50 text-blue-700': s.difference > 0
                    }"
                  >
                    {{ s.difference > 0 ? '+' : '' }}S/. {{ s.difference !== null ? s.difference : 0 }}
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
            <!-- Resumen Teórico del Sistema -->
            <div class="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
              <div class="flex items-center justify-between font-bold text-slate-700">
                <span class="flex items-center gap-1.5 text-slate-800">
                  <app-icon name="layers" [size]="14" class="text-amber-600"></app-icon>
                  Saldo Teórico del Sistema (Esperado)
                </span>
                <span class="font-mono text-slate-950 font-black text-sm">
                  S/. {{ currentShift()!.expected_cash }}
                </span>
              </div>

              <div class="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 text-[11px]">
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Fondo Inicial</span>
                  <span class="font-bold text-slate-800">S/. {{ currentShift()!.initial_cash }}</span>
                </div>
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Total Ingresos</span>
                  <span class="font-bold text-emerald-600">+S/. {{ currentShift()!.total_incomes }}</span>
                </div>
                <div class="bg-white p-2 rounded-xl border border-slate-100">
                  <span class="text-slate-400 block text-[10px] uppercase font-bold">Total Egresos</span>
                  <span class="font-bold text-red-600">-S/. {{ currentShift()!.total_expenses }}</span>
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
        `• Saldo Teórico Esperado: S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Físico Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia en Contra: -S/. ${absDiff}\n\n` +
        `En la gaveta física falta dinero en comparación con las operaciones registradas en el sistema.\n\n` +
        `¿Desea confirmar el cierre del turno activo con este faltante?`;
    } else if (diff > 0) {
      confirmTitle = `Descuadre: SOBRANTE de S/. ${absDiff}`;
      confirmType = 'warning';
      confirmBtnText = 'Sí, Cerrar con Sobrante';
      confirmMessage =
        `Se ha detectado un SOBRANTE en el arqueo físico de caja:\n\n` +
        `• Saldo Teórico Esperado: S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Físico Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia a Favor: +S/. ${absDiff}\n\n` +
        `En la gaveta física hay más dinero del registrado en el sistema.\n\n` +
        `¿Desea confirmar el cierre del turno activo con este sobrante?`;
    } else {
      confirmTitle = 'Cierre de Turno Cuadrado';
      confirmType = 'info';
      confirmBtnText = 'Sí, Cerrar Turno';
      confirmMessage =
        `El arqueo de caja coincide exactamente con el sistema:\n\n` +
        `• Saldo Esperado: S/. ${expected.toFixed(2)}\n` +
        `• Efectivo Contado: S/. ${actual.toFixed(2)}\n` +
        `• Diferencia: S/. 0.00\n\n` +
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
