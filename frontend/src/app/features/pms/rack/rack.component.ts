import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-pms-rack',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, StatusBadgeComponent, CustomSelectComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title and Summary Stats -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="bed" [size]="24" class="text-amber-600"></app-icon>
            Rack de Habitaciones (Tape Chart)
          </h1>
          <p class="text-xs text-slate-500">
            Monitor interactivo en tiempo real. Haga clic en cualquier habitación para Check-In directo, Folio o estado.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="goToWalkIn()"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="key" [size]="16" class="text-slate-950"></app-icon>
            Check-In Walk-In
          </button>

          <button
            type="button"
            (click)="loadAll()"
            class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="clock" [size]="14"></app-icon>
            Actualizar
          </button>
        </div>
      </div>

      <!-- STATUS SUMMARY CARDS -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div
          *ngFor="let stat of operationalStatuses()"
          class="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between"
          [style.borderLeftColor]="stat.color_hex"
          [style.borderLeftWidth]="'4px'"
        >
          <div>
            <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              {{ stat.name }}
            </span>
            <span class="text-2xl font-black text-slate-900 block mt-0.5">
              {{ getCountByOperational(stat.id) }}
            </span>
          </div>

          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            [style.backgroundColor]="stat.badge_bg_hex"
            [style.color]="stat.badge_text_hex"
          >
            <app-icon [name]="stat.icon_name || 'check-circle'" [size]="18"></app-icon>
          </div>
        </div>
      </div>

      <!-- ROOMS GRID BY FLOOR -->
      <div *ngFor="let floor of floors()" class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <app-icon name="building" [size]="16" class="text-slate-400"></app-icon>
            Piso {{ floor }}
          </h2>
          <span class="text-xs font-semibold text-slate-400">
            {{ getRoomsByFloor(floor).length }} habitaciones
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <div
            *ngFor="let room of getRoomsByFloor(floor)"
            (click)="selectRoom(room)"
            class="p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md relative overflow-hidden group select-none"
            [style.backgroundColor]="room.operational_status?.badge_bg_hex || '#FFFFFF'"
            [style.borderColor]="room.operational_status?.color_hex ? room.operational_status?.color_hex + '50' : '#E2E8F0'"
          >
            <!-- Room Number & Type -->
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-xs font-bold text-slate-500 block">Habitación</span>
                <span class="text-2xl font-black text-slate-900 tracking-tight block">
                  {{ room.room_number }}
                </span>
              </div>

              <!-- Operational Status Indicator Dot -->
              <div
                class="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border-2 border-white"
                [style.backgroundColor]="room.operational_status?.color_hex || '#10B981'"
                [title]="room.operational_status?.name"
              ></div>
            </div>

            <!-- Room Category and Occupant Info if Occupied -->
            <div class="text-xs mb-3">
              <span class="font-semibold block truncate text-slate-800">{{ room.room_type?.name }}</span>
              
              <div *ngIf="getActiveStay(room.id) as stay" class="mt-1 pt-1 border-t border-slate-200/50">
                <span class="font-bold text-slate-900 block truncate">
                  {{ stay.main_guest?.first_name }} {{ stay.main_guest?.last_name }}
                </span>
                <span class="text-[10px] text-slate-500 block">
                  Salida: {{ stay.check_out_date }}
                </span>
              </div>

              <div *ngIf="!getActiveStay(room.id)" class="text-[11px] text-slate-400 truncate">
                {{ room.room_type?.bed_summary }}
              </div>
            </div>

            <!-- Badges Footer -->
            <div class="pt-2 border-t border-slate-200/40 flex items-center justify-between gap-1">
              <!-- Housekeeping Badge -->
              <app-status-badge
                [text]="room.housekeeping_status?.name"
                [colorHex]="room.housekeeping_status?.color_hex"
                [bgHex]="room.housekeeping_status?.badge_bg_hex"
                [textHex]="room.housekeeping_status?.badge_text_hex"
                [iconName]="room.housekeeping_status?.icon_name"
              ></app-status-badge>

              <span class="text-[11px] font-bold text-slate-800">
                \${{ room.room_type?.base_price }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- QUICK ACTION ROOM MODAL -->
      <div
        *ngIf="selectedRoom()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-lg">
                {{ selectedRoom()!.room_number }}
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">
                  Habitación {{ selectedRoom()!.room_number }} — {{ selectedRoom()!.room_type?.name }}
                </h3>
                <span class="text-xs text-slate-500">Piso {{ selectedRoom()!.floor }} • Tarifa: \${{ selectedRoom()!.room_type?.base_price }} por noche</span>
              </div>
            </div>

            <button
              (click)="selectedRoom.set(null)"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- INFORMACIÓN Y ACCIONES OPERATIVAS SEGÚN ESTADO -->
          
          <!-- CASO 1: HABITACIÓN DISPONIBLE Y LIMPIA -->
          <div
            *ngIf="selectedRoom()!.operational_status?.code === 'AVAILABLE' && selectedRoom()!.housekeeping_status?.code === 'CLEAN'"
            class="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-4 space-y-3"
          >
            <div class="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <app-icon name="check-circle" [size]="18" class="text-emerald-600"></app-icon>
              Habitación Disponible y Limpia (Lista para entrega inmediata)
            </div>
            <p class="text-xs text-emerald-700">
              Puede registrar un huésped en mostrador y entregar llaves en este instante.
            </p>
            <div class="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                (click)="goToWalkIn(selectedRoom()!.id)"
                class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <app-icon name="key" [size]="16" class="text-slate-950"></app-icon>
                Check-In Inmediato (Walk-In)
              </button>
              <button
                type="button"
                (click)="goToNewRes(selectedRoom()!.id)"
                class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              >
                <app-icon name="calendar" [size]="16" class="text-amber-400"></app-icon>
                Reservar a Futuro
              </button>
            </div>
          </div>

          <!-- CASO 2: HABITACIÓN DISPONIBLE PERO SUCIA -->
          <div
            *ngIf="selectedRoom()!.operational_status?.code === 'AVAILABLE' && selectedRoom()!.housekeeping_status?.code !== 'CLEAN'"
            class="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-4 space-y-3"
          >
            <div class="flex items-center gap-2 text-amber-800 text-xs font-bold">
              <app-icon name="alert-triangle" [size]="18" class="text-amber-600"></app-icon>
              Habitación Disponible pero Pendiente de Limpieza
            </div>
            <p class="text-xs text-amber-700">
              El personal de camarería debe asear e inspeccionar la habitación antes de realizar el Check-In.
            </p>
            <div class="pt-1">
              <button
                type="button"
                (click)="markAsClean(selectedRoom()!)"
                class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <app-icon name="sparkles" [size]="16"></app-icon>
                Confirmar Habitación Limpia
              </button>
            </div>
          </div>

          <!-- CASO 3: HABITACIÓN OCUPADA CON HUÉSPED ACTIVO -->
          <div
            *ngIf="selectedRoom()!.operational_status?.code === 'OCCUPIED'"
            class="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-4 space-y-3"
          >
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500">Estadía Actual</span>
              <span class="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">En Hospedaje</span>
            </div>

            <div *ngIf="getActiveStay(selectedRoom()!.id) as stay" class="space-y-1.5 text-xs">
              <div class="font-bold text-slate-900 text-sm">
                {{ stay.main_guest?.first_name }} {{ stay.main_guest?.last_name }}
              </div>
              <div class="text-slate-500">
                Reserva: <span class="font-mono font-bold text-slate-700">{{ stay.reservation_code }}</span>
              </div>
              <div class="text-slate-500">
                Entrada: {{ stay.check_in_date }} • Salida prevista: {{ stay.check_out_date }}
              </div>
              <div class="font-bold text-slate-800 pt-1">
                Total: \${{ stay.total_amount }} | Saldo: \${{ getPendingBalance(stay) }}
              </div>

              <div class="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  (click)="goToFolio(stay.id)"
                  class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <app-icon name="shopping-bag" [size]="14" class="text-amber-600"></app-icon>
                  Ver Folio / Frigobar
                </button>

                <button
                  type="button"
                  (click)="goToCheckout(stay.id)"
                  class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <app-icon name="log-out" [size]="14" class="text-amber-400"></app-icon>
                  Realizar Check-Out
                </button>
              </div>
            </div>

            <div *ngIf="!getActiveStay(selectedRoom()!.id)" class="text-xs text-slate-400">
              Cargando información del huésped...
            </div>
          </div>

          <!-- SECCIÓN: CAMBIO MANUAL DE ESTADO OPERATIVO / LIMPIEZA -->
          <div class="border-t border-slate-100 pt-4 space-y-4">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Ajuste Administrativo de Estados
            </span>

            <!-- Selector de Estado Operativo -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado Operativo (Ocupación)
              </label>
              <app-custom-select
                [options]="opOptions"
                [(ngModel)]="editStatusData.opId"
              ></app-custom-select>
            </div>

            <!-- Selector de Estado de Limpieza -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Estado de Limpieza (Housekeeping)
              </label>
              <app-custom-select
                [options]="hkOptions"
                [(ngModel)]="editStatusData.hkId"
              ></app-custom-select>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="selectedRoom.set(null)"
              class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            <button
              type="button"
              (click)="saveRoomStatus()"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <app-icon name="check" [size]="16"></app-icon>
              Actualizar Estado
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class RackComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  rooms = signal<any[]>([]);
  reservations = signal<any[]>([]);
  operationalStatuses = signal<any[]>([]);
  housekeepingStatuses = signal<any[]>([]);
  selectedRoom = signal<any | null>(null);

  editStatusData = {
    opId: 1,
    hkId: 1
  };

  opOptions: SelectOption[] = [];
  hkOptions: SelectOption[] = [];

  ngOnInit() {
    this.loadStatuses();
    this.loadAll();
  }

  loadAll() {
    this.loadRooms();
    this.loadReservations();
  }

  loadStatuses() {
    this.api.get<any[]>('statuses/operational').subscribe((ops) => {
      this.operationalStatuses.set(ops);
      this.opOptions = ops.map((o) => ({
        value: o.id,
        label: o.name,
        badge: { colorHex: o.color_hex }
      }));
    });

    this.api.get<any[]>('statuses/housekeeping').subscribe((hks) => {
      this.housekeepingStatuses.set(hks);
      this.hkOptions = hks.map((h) => ({
        value: h.id,
        label: h.name,
        badge: { colorHex: h.color_hex }
      }));
    });
  }

  loadRooms() {
    this.api.get<any[]>('rooms').subscribe({
      next: (data) => {
        this.rooms.set(data);
      },
      error: () => {
        this.toast.error('No se pudo cargar el listado de habitaciones');
      }
    });
  }

  loadReservations() {
    this.api.get<any[]>('reservations').subscribe((resList) => {
      this.reservations.set(resList);
    });
  }

  floors(): number[] {
    const list = this.rooms().map((r) => r.floor);
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }

  getRoomsByFloor(floor: number): any[] {
    return this.rooms().filter((r) => r.floor === floor);
  }

  getCountByOperational(opId: number): number {
    return this.rooms().filter((r) => r.operational_status_id === opId).length;
  }

  getActiveStay(roomId: number): any | null {
    return this.reservations().find(
      (res) => res.status?.code === 'CHECKED_IN' && res.rooms?.some((rr: any) => rr.room_id === roomId)
    ) || null;
  }

  getPendingBalance(res: any): number {
    if (!res) return 0;
    return Math.max(0, Number(res.total_amount || 0) - Number(res.paid_amount || 0));
  }

  selectRoom(room: any) {
    this.selectedRoom.set(room);
    this.editStatusData.opId = room.operational_status_id;
    this.editStatusData.hkId = room.housekeeping_status_id;
  }

  goToWalkIn(roomId?: number) {
    this.selectedRoom.set(null);
    if (roomId) {
      this.router.navigate(['/pms/reservations'], { queryParams: { action: 'walkin', room_id: roomId } });
    } else {
      this.router.navigate(['/pms/reservations'], { queryParams: { action: 'walkin' } });
    }
  }

  goToNewRes(roomId: number) {
    this.selectedRoom.set(null);
    this.router.navigate(['/pms/reservations'], { queryParams: { action: 'new', room_id: roomId } });
  }

  goToFolio(resId: number) {
    this.selectedRoom.set(null);
    this.router.navigate(['/pms/reservations'], { queryParams: { action: 'folio', res_id: resId } });
  }

  goToCheckout(resId: number) {
    this.selectedRoom.set(null);
    this.router.navigate(['/pms/reservations'], { queryParams: { action: 'checkout', res_id: resId } });
  }

  markAsClean(room: any) {
    const cleanStatus = this.housekeepingStatuses().find((h) => h.code === 'CLEAN');
    if (!cleanStatus) return;

    this.api.put(`rooms/${room.id}/status`, {
      operational_status_id: room.operational_status_id,
      housekeeping_status_id: cleanStatus.id
    }).subscribe({
      next: () => {
        this.toast.success(`Habitación ${room.room_number} marcada como limpia`);
        this.selectedRoom.set(null);
        this.loadRooms();
      },
      error: () => this.toast.error('Error al actualizar estado')
    });
  }

  saveRoomStatus() {
    const room = this.selectedRoom();
    if (!room) return;

    this.api.put(`rooms/${room.id}/status`, {
      operational_status_id: this.editStatusData.opId,
      housekeeping_status_id: this.editStatusData.hkId
    }).subscribe({
      next: () => {
        this.toast.success(`Habitación ${room.room_number} actualizada`);
        this.selectedRoom.set(null);
        this.loadRooms();
      },
      error: () => {
        this.toast.error('Error al actualizar el estado de la habitación');
      }
    });
  }
}
