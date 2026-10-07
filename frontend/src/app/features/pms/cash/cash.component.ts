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
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  \$
                </div>
                <input
                  type="number"
                  step="0.10"
                  [(ngModel)]="openShiftForm.initial_cash"
                  placeholder="100.00"
                  class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-hidden focus:border-amber-500"
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
                \${{ currentShift()!.initial_cash }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Apertura de turno</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-emerald-500">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Ingresos</span>
              <span class="text-2xl font-black text-emerald-600 block mt-1">
                +\${{ currentShift()!.total_incomes }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Hospedaje & extras</span>
            </div>

            <div class="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs border-l-4 border-l-red-500">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Egresos</span>
              <span class="text-2xl font-black text-red-600 block mt-1">
                -\${{ currentShift()!.total_expenses }}
              </span>
              <span class="text-[10px] text-slate-400 font-medium block mt-1">Compras & gastos menores</span>
            </div>

            <div class="bg-slate-900 p-5 rounded-2xl text-white shadow-md">
              <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Efectivo en Caja</span>
              <span class="text-2xl font-black text-amber-400 block mt-1">
                \${{ currentShift()!.expected_cash }}
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
                      {{ m.movement_type === 'INCOME' ? '+' : '-' }}\${{ m.amount }}
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
                <td class="px-6 py-4 font-bold text-slate-900">\${{ s.expected_cash }}</td>
                <td class="px-6 py-4 font-bold text-slate-900">\${{ s.actual_cash !== null ? s.actual_cash : '-' }}</td>
                <td class="px-6 py-4 text-right">
                  <span
                    class="font-bold px-2 py-1 rounded-md text-xs"
                    [ngClass]="{
                      'bg-emerald-50 text-emerald-700': s.difference == 0,
                      'bg-red-50 text-red-700': s.difference < 0,
                      'bg-blue-50 text-blue-700': s.difference > 0
                    }"
                  >
                    {{ s.difference > 0 ? '+' : '' }}\${{ s.difference !== null ? s.difference : 0 }}
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

      <!-- MODAL CIERRE DE TURNO (ARQUEO CIEGO) -->
      <div
        *ngIf="showCloseModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900">Arqueo Ciego & Cierre de Turno</h3>
            <button (click)="showCloseModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="space-y-4">
            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
              <strong>Arqueo Ciego:</strong> Ingrese el total exacto de billetes y monedas contados en la gaveta. El sistema contrastará el dinero con el registro de operaciones.
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Efectivo Físico Contado *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  \$
                </div>
                <input
                  type="number"
                  step="0.10"
                  [(ngModel)]="closeShiftForm.actual_cash"
                  placeholder="0.00"
                  class="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Observaciones del Cierre
              </label>
              <textarea
                [(ngModel)]="closeShiftForm.notes"
                rows="2"
                placeholder="Comentarios adicionales o justificación de novedades..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              ></textarea>
            </div>
          </div>

          <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
            <button
              type="button"
              (click)="showCloseModal.set(false)"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="executeCloseShift()"
              class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md shadow-red-600/20 cursor-pointer"
            >
              Confirmar Cierre de Turno
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

  async executeCloseShift() {
    const shift = this.currentShift();
    if (!shift || this.closeShiftForm.actual_cash === null) {
      this.toast.warning('Ingrese el monto físico contado');
      return;
    }

    this.api.post('cash/close', {
      shift_id: shift.id,
      actual_cash: this.closeShiftForm.actual_cash,
      notes: this.closeShiftForm.notes
    }).subscribe({
      next: async (closed: any) => {
        this.showCloseModal.set(false);
        this.closeShiftForm = { actual_cash: null, notes: '' };

        const diff = Number(closed.difference || 0);
        let title = 'Cuadre Exacto de Turno';
        let type: 'success' | 'warning' | 'danger' = 'success';
        let detail = `El dinero físico contado (\${closed.actual_cash}) coincide exactamente con el saldo esperado (\${closed.expected_cash}).`;

        if (diff < 0) {
          title = 'Faltante en Caja';
          type = 'danger';
          detail = `Se detectó un FALTANTE de \$${Math.abs(diff)} en el arqueo físico (Contado: \$${closed.actual_cash} | Esperado: \$${closed.expected_cash}).`;
        } else if (diff > 0) {
          title = 'Sobrante en Caja';
          type = 'warning';
          detail = `Se detectó un SOBRANTE de \$${diff} en el arqueo físico (Contado: \$${closed.actual_cash} | Esperado: \$${closed.expected_cash}).`;
        }

        await this.dialog.alert(title, detail, type);
        this.loadCurrentShift();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al cerrar caja')
    });
  }
}
