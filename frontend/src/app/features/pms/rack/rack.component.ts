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
            Rack de Habitaciones
          </h1>
          <p class="text-xs text-slate-500">
            Monitor interactivo del estado de inventario, ocupación y gobernanza en tiempo real.
          </p>
        </div>

        <button
          (click)="loadRooms()"
          class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <app-icon name="clock" [size]="14"></app-icon>
          Actualizar Rack
        </button>
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
            <app-icon name="layers" [size]="16" class="text-slate-400"></app-icon>
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
            class="p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-md relative overflow-hidden group"
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

              <!-- Operational Status Indicator -->
              <div
                class="w-3 h-3 rounded-full shrink-0 shadow-xs"
                [style.backgroundColor]="room.operational_status?.color_hex || '#10B981'"
                [title]="room.operational_status?.name"
              ></div>
            </div>

            <!-- Room Category and Bed info -->
            <div class="text-xs text-slate-600 mb-3 truncate">
              <span class="font-semibold block truncate">{{ room.room_type?.name }}</span>
              <span class="text-[11px] text-slate-500 block truncate">{{ room.room_type?.bed_summary }}</span>
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
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black text-lg">
                {{ selectedRoom()!.room_number }}
              </div>
              <div>
                <h3 class="text-base font-bold text-slate-900">
                  Habitación {{ selectedRoom()!.room_number }} — {{ selectedRoom()!.room_type?.name }}
                </h3>
                <span class="text-xs text-slate-500">Piso {{ selectedRoom()!.floor }} • Tarifa: \${{ selectedRoom()!.room_type?.base_price }}</span>
              </div>
            </div>

            <button
              (click)="selectedRoom.set(null)"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="space-y-4 py-2">
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
              Cancelar
            </button>

            <button
              type="button"
              (click)="saveRoomStatus()"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
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

  rooms = signal<any[]>([]);
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
    this.loadRooms();
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

  selectRoom(room: any) {
    this.selectedRoom.set(room);
    this.editStatusData.opId = room.operational_status_id;
    this.editStatusData.hkId = room.housekeeping_status_id;
  }

  saveRoomStatus() {
    const room = this.selectedRoom();
    if (!room) return;

    this.api.put(`rooms/${room.id}/status`, {
      operational_status_id: this.editStatusData.opId,
      housekeeping_status_id: this.editStatusData.hkId
    }).subscribe({
      next: (updated) => {
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
