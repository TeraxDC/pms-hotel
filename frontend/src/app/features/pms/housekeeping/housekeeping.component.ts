import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-pms-housekeeping',
  standalone: true,
  imports: [CommonModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-6">
      
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <app-icon name="sparkles" [size]="24" class="text-amber-600"></app-icon>
          Gobernanza & Housekeeping (Limpieza)
        </h1>
        <p class="text-xs text-slate-500">
          Vista optimizada para camareras y personal de limpieza desde dispositivos móviles.
        </p>
      </div>

      <!-- FILTER TABS -->
      <div class="flex items-center gap-2 overflow-x-auto pb-2">
        <button
          type="button"
          (click)="filterFloor.set(null)"
          [ngClass]="filterFloor() === null ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          Todos los Pisos
        </button>

        <button
          *ngFor="let floor of floors()"
          type="button"
          (click)="filterFloor.set(floor)"
          [ngClass]="filterFloor() === floor ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-700'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          Piso {{ floor }}
        </button>
      </div>

      <!-- ROOMS HOUSEKEEPING CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          *ngFor="let room of filteredRooms()"
          class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 flex flex-col justify-between space-y-4"
        >
          <div class="flex items-start justify-between">
            <div>
              <span class="text-xs font-bold text-slate-400">Piso {{ room.floor }}</span>
              <h3 class="text-2xl font-black text-slate-900 tracking-tight">
                Hab. {{ room.room_number }}
              </h3>
              <span class="text-xs text-slate-500 font-semibold">{{ room.room_type?.name }}</span>
            </div>

            <!-- Current Housekeeping Status Badge -->
            <app-status-badge
              [text]="room.housekeeping_status?.name"
              [colorHex]="room.housekeeping_status?.color_hex"
              [bgHex]="room.housekeeping_status?.badge_bg_hex"
              [textHex]="room.housekeeping_status?.badge_text_hex"
              [iconName]="room.housekeeping_status?.icon_name"
            ></app-status-badge>
          </div>

          <!-- Quick Action Buttons for Cleaning Staff -->
          <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
            <!-- Pasar a En Limpieza -->
            <button
              *ngIf="room.housekeeping_status?.code !== 'IN_PROGRESS'"
              type="button"
              (click)="updateStatus(room, 'IN_PROGRESS')"
              class="flex-1 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <app-icon name="sparkles" [size]="14"></app-icon>
              En Limpieza
            </button>

            <!-- Marcar como Limpia -->
            <button
              *ngIf="room.housekeeping_status?.code !== 'CLEAN'"
              type="button"
              (click)="updateStatus(room, 'CLEAN')"
              class="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <app-icon name="check-circle" [size]="14"></app-icon>
              Lista / Limpia
            </button>

            <!-- Marcar como Sucia si está limpia -->
            <button
              *ngIf="room.housekeeping_status?.code === 'CLEAN'"
              type="button"
              (click)="updateStatus(room, 'DIRTY')"
              class="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <app-icon name="clock" [size]="14"></app-icon>
              Marcar Sucia
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class HousekeepingComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  rooms = signal<any[]>([]);
  hkStatuses = signal<any[]>([]);
  filterFloor = signal<number | null>(null);

  ngOnInit() {
    this.loadStatuses();
    this.loadRooms();
  }

  loadStatuses() {
    this.api.get<any[]>('statuses/housekeeping').subscribe((data) => this.hkStatuses.set(data));
  }

  loadRooms() {
    this.api.get<any[]>('rooms').subscribe((data) => this.rooms.set(data));
  }

  floors(): number[] {
    const list = this.rooms().map((r) => r.floor);
    return Array.from(new Set(list)).sort((a, b) => a - b);
  }

  filteredRooms(): any[] {
    const floor = this.filterFloor();
    if (floor === null) return this.rooms();
    return this.rooms().filter((r) => r.floor === floor);
  }

  updateStatus(room: any, statusCode: string) {
    const targetStatus = this.hkStatuses().find((s) => s.code === statusCode);
    if (!targetStatus) return;

    this.api.put(`rooms/${room.id}/status`, {
      housekeeping_status_id: targetStatus.id
    }).subscribe({
      next: () => {
        this.toast.success(`Habitación ${room.room_number} actualizada a ${targetStatus.name}`);
        this.loadRooms();
      },
      error: () => this.toast.error('Error al actualizar el estado de limpieza')
    });
  }
}
