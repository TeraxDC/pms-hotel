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
            Gestión de Reservas & Huéspedes
          </h1>
          <p class="text-xs text-slate-500">
            Control de ingresos, salidas, folios y cuentas de huéspedes.
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

                  <!-- Botón Ver Folio / Pagos -->
                  <button
                    type="button"
                    (click)="viewFolio(res)"
                    class="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Folio
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
            <!-- Datos del Huésped -->
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

            <!-- Habitación y Fechas -->
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
  showNewModal = signal<boolean>(false);

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

  ngOnInit() {
    this.loadReservations();
    this.loadRooms();
  }

  loadReservations() {
    this.api.get<any[]>('reservations').subscribe({
      next: (data) => this.reservations.set(data),
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

  getPendingBalance(res: any): number {
    return Math.max(0, Number(res.total_amount || 0) - Number(res.paid_amount || 0));
  }

  openNewModal() {
    this.newForm.selectedRoomId = this.rooms()[0]?.id || null;
    this.showNewModal.set(true);
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

  viewFolio(res: any) {
    this.dialog.alert(
      `Folio: ${res.reservation_code}`,
      `Total Hospedaje: \$${res.total_accommodation} | Cargos Extras: \$${res.total_extras} | Total Pagado: \$${res.paid_amount} | Saldo: \$${this.getPendingBalance(res)}`,
      'info'
    );
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
