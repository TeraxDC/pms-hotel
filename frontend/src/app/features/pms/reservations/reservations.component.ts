import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-pms-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, StatusBadgeComponent, CustomSelectComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="calendar" [size]="24" class="text-amber-600"></app-icon>
            Gestión de Reservas, Huéspedes & Folios
          </h1>
          <p class="text-xs text-slate-500">
            Control de ingresos, salidas, consumos de frigobar y facturación de cuentas.
          </p>
        </div>

        <button
          type="button"
          (click)="openNewModal()"
          class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <app-icon name="plus" [size]="16" class="text-amber-400"></app-icon>
          Nueva Reserva / Walk-in
        </button>
      </div>

      <!-- RESERVATIONS TABLE -->
      <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600">
            <thead class="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th class="px-6 py-4">Código</th>
                <th class="px-6 py-4">Huésped Titular</th>
                <th class="px-6 py-4">Habitación</th>
                <th class="px-6 py-4">Estadía</th>
                <th class="px-6 py-4">Estado</th>
                <th class="px-6 py-4">Total / Saldo</th>
                <th class="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let res of reservations()" class="hover:bg-slate-50/80 transition-colors">
                <!-- Código -->
                <td class="px-6 py-4 font-mono font-bold text-slate-900">
                  {{ res.reservation_code }}
                </td>

                <!-- Huésped -->
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900">
                    {{ res.main_guest?.first_name }} {{ res.main_guest?.last_name }}
                  </div>
                  <div class="text-[11px] text-slate-400">
                    Doc: {{ res.main_guest?.document_number }}
                  </div>
                </td>

                <!-- Habitación -->
                <td class="px-6 py-4">
                  <div *ngFor="let rr of res.rooms" class="font-semibold text-slate-800">
                    Hab. {{ rr.room?.room_number }} ({{ rr.room?.room_type?.name }})
                  </div>
                </td>

                <!-- Estadía -->
                <td class="px-6 py-4">
                  <div class="font-semibold text-slate-800">{{ res.check_in_date }}</div>
                  <div class="text-[11px] text-slate-400">al {{ res.check_out_date }}</div>
                </td>

                <!-- Estado -->
                <td class="px-6 py-4">
                  <app-status-badge
                    [text]="res.status?.name"
                    [colorHex]="res.status?.color_hex"
                    [bgHex]="res.status?.badge_bg_hex"
                    [textHex]="res.status?.badge_text_hex"
                    [iconName]="res.status?.icon_name"
                  ></app-status-badge>
                </td>

                <!-- Total y Saldo -->
                <td class="px-6 py-4">
                  <div class="font-bold text-slate-900">\${{ res.total_amount }}</div>
                  <div
                    class="text-[11px] font-semibold"
                    [ngClass]="getPendingBalance(res) > 0 ? 'text-amber-600' : 'text-emerald-600'"
                  >
                    Saldo: \${{ getPendingBalance(res) }}
                  </div>
                </td>

                <!-- Acciones -->
                <td class="px-6 py-4 text-right space-x-2">
                  <!-- Botón Check-In si está confirmada -->
                  <button
                    *ngIf="res.status?.code === 'CONFIRMED' || res.status?.code === 'PENDING'"
                    type="button"
                    (click)="doCheckIn(res)"
                    class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Check-In
                  </button>

                  <!-- Botón Check-Out si tiene check-in activo -->
                  <button
                    *ngIf="res.status?.code === 'CHECKED_IN'"
                    type="button"
                    (click)="doCheckOut(res)"
                    class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-colors cursor-pointer"
                  >
                    Check-Out
                  </button>

                  <!-- Botón Ver Folio Completo -->
                  <button
                    type="button"
                    (click)="openFolioModal(res)"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Ver Folio
                  </button>
                </td>
              </tr>

              <tr *ngIf="reservations().length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-slate-400">
                  <app-icon name="calendar" [size]="32" class="mx-auto mb-2 text-slate-300"></app-icon>
                  No hay reservas registradas en este momento
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- MODAL FOLIO COMPLETO & CARGOS EXTRAS -->
      <div
        *ngIf="showFolioModal() && currentFolio()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-2xl w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-md bg-slate-900 text-amber-400 font-mono text-xs font-bold">
                  {{ currentFolio()!.reservation_code }}
                </span>
                <h3 class="text-base font-bold text-slate-900">
                  Folio: {{ currentFolio()!.main_guest?.first_name }} {{ currentFolio()!.main_guest?.last_name }}
                </h3>
              </div>
              <span class="text-xs text-slate-400">
                Estadía: {{ currentFolio()!.check_in_date }} al {{ currentFolio()!.check_out_date }}
              </span>
            </div>

            <button (click)="showFolioModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Totals Ribbon -->
          <div class="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 text-center">
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Total Estancia</span>
              <span class="text-lg font-black text-slate-900 block">\${{ currentFolio()!.total_accommodation }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Cargos Extras</span>
              <span class="text-lg font-black text-amber-600 block">+\${{ currentFolio()!.total_extras }}</span>
            </div>
            <div>
              <span class="text-[10px] font-bold uppercase text-slate-400 block">Saldo Pendiente</span>
              <span
                class="text-lg font-black block"
                [ngClass]="getPendingBalance(currentFolio()!) > 0 ? 'text-red-600' : 'text-emerald-600'"
              >
                \${{ getPendingBalance(currentFolio()!) }}
              </span>
            </div>
          </div>

          <!-- Cargos Extras (Frigobar / Servicios) -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <app-icon name="shopping-bag" [size]="16" class="text-amber-600"></app-icon>
                Consumos Extras / Frigobar
              </h4>
              <button
                type="button"
                (click)="showAddExtra.set(true)"
                class="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 text-xs font-bold transition-colors cursor-pointer"
              >
                + Agregar Consumo
              </button>
            </div>

            <div class="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div *ngFor="let charge of currentFolio()!.extra_charges" class="p-3 bg-white flex items-center justify-between border-b border-slate-50">
                <div>
                  <span class="font-bold text-slate-900 block">{{ charge.concept }}</span>
                  <span class="text-[10px] text-slate-400">{{ charge.category?.name || 'Consumo' }} (Cant: {{ charge.quantity }})</span>
                </div>
                <span class="font-bold text-slate-800">\${{ charge.total_price }}</span>
              </div>
              <div *ngIf="!currentFolio()!.extra_charges || currentFolio()!.extra_charges.length === 0" class="p-3 text-center text-slate-400">
                Sin cargos extras registrados
              </div>
            </div>
          </div>

          <!-- Pagos y Abonos -->
          <div class="space-y-3 mb-6">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <app-icon name="credit-card" [size]="16" class="text-emerald-600"></app-icon>
                Pagos & Abonos Realizados
              </h4>
              <button
                type="button"
                (click)="showAddPayment.set(true)"
                class="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 text-xs font-bold transition-colors cursor-pointer"
              >
                + Registrar Pago
              </button>
            </div>

            <div class="border border-slate-100 rounded-xl overflow-hidden text-xs">
              <div *ngFor="let pay of currentFolio()!.payments" class="p-3 bg-white flex items-center justify-between border-b border-slate-50">
                <div>
                  <span class="font-bold text-slate-900 block">{{ pay.payment_method?.name || 'Pago' }}</span>
                  <span class="text-[10px] text-slate-400">{{ pay.paid_at | date:'short' }} {{ pay.reference_code ? '• Ref: ' + pay.reference_code : '' }}</span>
                </div>
                <span class="font-bold text-emerald-600">+\${{ pay.amount }}</span>
              </div>
              <div *ngIf="!currentFolio()!.payments || currentFolio()!.payments.length === 0" class="p-3 text-center text-slate-400">
                No hay pagos registrados aún
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              (click)="printReceipt()"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="file-text" [size]="16"></app-icon>
              Imprimir Comprobante
            </button>

            <button
              type="button"
              (click)="showFolioModal.set(false)"
              class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Cerrar Folio
            </button>
          </div>

        </div>
      </div>

      <!-- MODAL AGREGAR CONSUMO EXTRA -->
      <div
        *ngIf="showAddExtra()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Agregar Consumo de Frigobar / Servicio</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Concepto *</label>
              <input
                type="text"
                [(ngModel)]="extraForm.concept"
                placeholder="Ej. Agua Mineral con Gas 500ml"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Cantidad</label>
                <input
                  type="number"
                  [(ngModel)]="extraForm.quantity"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Precio Unit. (\$) *</label>
                <input
                  type="number"
                  step="0.5"
                  [(ngModel)]="extraForm.unit_price"
                  class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showAddExtra.set(false)"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="saveExtraCharge()"
              class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
            >
              Guardar Cargo
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL REGISTRAR PAGO -->
      <div
        *ngIf="showAddPayment()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800">
          <h3 class="text-sm font-bold text-slate-900 mb-3">Registrar Pago / Abono a la Cuenta</h3>

          <div class="space-y-3">
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Monto a Cobrar (\$) *</label>
              <input
                type="number"
                step="0.5"
                [(ngModel)]="paymentForm.amount"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-base font-black text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Método de Pago *</label>
              <app-custom-select
                [options]="payMethodOptions"
                [(ngModel)]="paymentForm.payment_method_id"
              ></app-custom-select>
            </div>
            <div>
              <label class="block text-[11px] font-bold text-slate-600 mb-1">Nº Operación / Voucher</label>
              <input
                type="text"
                [(ngModel)]="paymentForm.reference_code"
                placeholder="OP-987654"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              (click)="showAddPayment.set(false)"
              class="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              (click)="savePayment()"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer"
            >
              Cobrar Abono
            </button>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVA RESERVA / WALK-IN -->
      <div
        *ngIf="showNewModal()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="plus" [size]="18" class="text-amber-500"></app-icon>
              Registrar Reserva / Entrada
            </h3>
            <button (click)="showNewModal.set(false)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="createReservation()" class="space-y-4">
            <div class="border-b border-slate-100 pb-3">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Huésped Titular</span>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">DNI / Pasaporte *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.document_number"
                    name="docNum"
                    required
                    placeholder="74829102"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Nombres *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.first_name"
                    name="firstName"
                    required
                    placeholder="Juan Carlos"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.last_name"
                    name="lastName"
                    required
                    placeholder="Pérez Gómez"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    [(ngModel)]="newForm.guest.phone"
                    name="phone"
                    placeholder="+51 987654321"
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Asignación y Fechas</span>
              <div class="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Check-In *</label>
                  <input
                    type="date"
                    [(ngModel)]="newForm.check_in_date"
                    name="checkInDate"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-1">Check-Out *</label>
                  <input
                    type="date"
                    [(ngModel)]="newForm.check_out_date"
                    name="checkOutDate"
                    required
                    class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-bold text-slate-600 mb-1">Seleccionar Habitación *</label>
                <app-custom-select
                  [options]="roomOptions"
                  [(ngModel)]="newForm.selectedRoomId"
                  name="selectedRoom"
                  placeholder="Seleccione la habitación"
                ></app-custom-select>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showNewModal.set(false)"
                class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                Crear Reserva
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class ReservationsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  reservations = signal<any[]>([]);
  rooms = signal<any[]>([]);
  roomOptions: SelectOption[] = [];
  payMethodOptions: SelectOption[] = [];

  showNewModal = signal<boolean>(false);
  showFolioModal = signal<boolean>(false);
  showAddExtra = signal<boolean>(false);
  showAddPayment = signal<boolean>(false);

  currentFolio = signal<any | null>(null);

  newForm = {
    guest: {
      document_type_id: 1,
      document_number: '',
      first_name: '',
      last_name: '',
      phone: ''
    },
    check_in_date: new Date().toISOString().substring(0, 10),
    check_out_date: new Date(Date.now() + 86400000).toISOString().substring(0, 10),
    selectedRoomId: null,
    total_guests: 1
  };

  extraForm = {
    concept: '',
    quantity: 1,
    unit_price: 5.0
  };

  paymentForm = {
    amount: 50.0,
    payment_method_id: 1,
    reference_code: ''
  };

  ngOnInit() {
    this.loadReservations();
    this.loadRooms();
    this.loadPaymentMethods();
  }

  loadReservations() {
    this.api.get<any[]>('reservations').subscribe({
      next: (data) => {
        this.reservations.set(data);
        if (this.currentFolio()) {
          const updated = data.find((r) => r.id === this.currentFolio().id);
          if (updated) this.currentFolio.set(updated);
        }
      },
      error: () => this.toast.error('No se pudieron cargar las reservas')
    });
  }

  loadRooms() {
    this.api.get<any[]>('rooms').subscribe((data) => {
      this.rooms.set(data);
      this.roomOptions = data.map((r) => ({
        value: r.id,
        label: `Habitación ${r.room_number} - ${r.room_type?.name} (\${${r.room_type?.base_price}})`,
        sublabel: `Piso ${r.floor}`
      }));
    });
  }

  loadPaymentMethods() {
    this.api.get<any[]>('statuses/payment-methods').subscribe((data) => {
      this.payMethodOptions = data.map((pm) => ({
        value: pm.id,
        label: pm.name
      }));
    });
  }

  getPendingBalance(res: any): number {
    return Math.max(0, Number(res.total_amount || 0) - Number(res.paid_amount || 0));
  }

  openNewModal() {
    this.newForm.selectedRoomId = this.rooms()[0]?.id || null;
    this.showNewModal.set(true);
  }

  openFolioModal(res: any) {
    this.api.get(`reservations/${res.id}`).subscribe({
      next: (full) => {
        this.currentFolio.set(full);
        this.paymentForm.amount = this.getPendingBalance(full);
        this.showFolioModal.set(true);
      }
    });
  }

  saveExtraCharge() {
    const folio = this.currentFolio();
    if (!folio || !this.extraForm.concept || !this.extraForm.unit_price) {
      this.toast.warning('Complete el concepto y precio');
      return;
    }

    this.api.post(`reservations/${folio.id}/extras`, {
      concept: this.extraForm.concept,
      quantity: this.extraForm.quantity,
      unit_price: this.extraForm.unit_price
    }).subscribe({
      next: (updated) => {
        this.toast.success('Cargo extra registrado al folio');
        this.currentFolio.set(updated);
        this.showAddExtra.set(false);
        this.extraForm = { concept: '', quantity: 1, unit_price: 5.0 };
        this.loadReservations();
      },
      error: () => this.toast.error('Error al registrar cargo extra')
    });
  }

  savePayment() {
    const folio = this.currentFolio();
    if (!folio || !this.paymentForm.amount || !this.paymentForm.payment_method_id) {
      this.toast.warning('Ingrese el monto y método de pago');
      return;
    }

    this.api.post(`reservations/${folio.id}/payments`, this.paymentForm).subscribe({
      next: (updated) => {
        this.toast.success('Pago registrado correctamente');
        this.currentFolio.set(updated);
        this.showAddPayment.set(false);
        this.loadReservations();
      },
      error: () => this.toast.error('Error al registrar pago')
    });
  }

  printReceipt() {
    window.print();
  }

  async doCheckIn(res: any) {
    const confirm = await this.dialog.confirm({
      title: 'Realizar Check-In',
      message: `¿Desea ingresar el Check-In para la reserva ${res.reservation_code}? La habitación pasará a estado OCUPADA.`,
      type: 'info',
      confirmText: 'Registrar Entrada'
    });
    if (!confirm) return;

    this.api.post(`reservations/${res.id}/checkin`, {}).subscribe({
      next: () => {
        this.toast.success(`Check-In realizado para ${res.reservation_code}`);
        this.loadReservations();
      },
      error: () => this.toast.error('Error al procesar el Check-In')
    });
  }

  async doCheckOut(res: any) {
    const pending = this.getPendingBalance(res);
    let message = `¿Desea registrar el Check-Out para la reserva ${res.reservation_code}? La habitación quedará en estado SUCIA para limpieza.`;
    if (pending > 0) {
      message = `¡ATENCIÓN! El huésped tiene un saldo pendiente de \$${pending}. ¿Desea proceder con el Check-Out?`;
    }

    const confirm = await this.dialog.confirm({
      title: 'Realizar Check-Out',
      message,
      type: pending > 0 ? 'warning' : 'info',
      confirmText: 'Completar Salida'
    });
    if (!confirm) return;

    this.api.post(`reservations/${res.id}/checkout`, {}).subscribe({
      next: () => {
        this.toast.success(`Check-Out finalizado para ${res.reservation_code}`);
        this.loadReservations();
      },
      error: () => this.toast.error('Error al procesar el Check-Out')
    });
  }

  createReservation() {
    if (!this.newForm.guest.document_number || !this.newForm.guest.first_name || !this.newForm.selectedRoomId) {
      this.toast.warning('Por favor complete los campos obligatorios');
      return;
    }

    const payload = {
      guest: this.newForm.guest,
      room_ids: [this.newForm.selectedRoomId],
      check_in_date: this.newForm.check_in_date,
      check_out_date: this.newForm.check_out_date,
      total_guests: 1
    };

    this.api.post('reservations', payload).subscribe({
      next: () => {
        this.toast.success('Reserva creada exitosamente');
        this.showNewModal.set(false);
        this.loadReservations();
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Error al crear la reserva');
      }
    });
  }
}
