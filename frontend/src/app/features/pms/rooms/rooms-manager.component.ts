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
  selector: 'app-rooms-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, StatusBadgeComponent, CustomSelectComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Top Title Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="bed" [size]="24" class="text-amber-600"></app-icon>
            Habitaciones & Tarifas
          </h1>
          <p class="text-xs text-slate-500">
            Administre el inventario de habitaciones físicas y la edición de tarifas por noche en Soles (S/.).
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-2">
          <button
            *ngIf="activeTab === 'rooms'"
            type="button"
            (click)="openNewRoomModal()"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="plus" [size]="16" class="text-slate-950"></app-icon>
            Nueva Habitación
          </button>

          <button
            *ngIf="activeTab === 'types'"
            type="button"
            (click)="openNewTypeModal()"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="plus" [size]="16" class="text-slate-950"></app-icon>
            Nueva Categoría / Tarifa
          </button>

          <button
            type="button"
            (click)="loadData()"
            class="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <app-icon name="clock" [size]="14"></app-icon>
            Actualizar
          </button>
        </div>
      </div>

      <!-- TAB BUTTONS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          (click)="activeTab = 'rooms'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          [ngClass]="activeTab === 'rooms' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        >
          <app-icon name="layers" [size]="16" [class.text-amber-400]="activeTab === 'rooms'"></app-icon>
          Inventario de Habitaciones ({{ rooms().length }})
        </button>

        <button
          type="button"
          (click)="activeTab = 'types'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
          [ngClass]="activeTab === 'types' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
        >
          <app-icon name="dollar-sign" [size]="16" [class.text-amber-400]="activeTab === 'types'"></app-icon>
          Categorías & Tarifas en Soles ({{ roomTypes().length }})
        </button>
      </div>

      <!-- ========================================== -->
      <!-- TAB 1: INVENTARIO DE HABITACIONES FÍSICAS -->
      <!-- ========================================== -->
      <div *ngIf="activeTab === 'rooms'" class="space-y-4">
        
        <!-- Floor Filter Bar -->
        <div class="flex flex-wrap items-center gap-2">
          <button
            type="button"
            (click)="selectedFloor = null"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            [ngClass]="selectedFloor === null ? 'bg-amber-500/20 text-amber-900 font-bold border border-amber-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            Todos los Pisos
          </button>
          <button
            *ngFor="let fl of availableFloors()"
            type="button"
            (click)="selectedFloor = fl"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            [ngClass]="selectedFloor === fl ? 'bg-amber-500/20 text-amber-900 font-bold border border-amber-300' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'"
          >
            Piso {{ fl }}
          </button>
        </div>

        <!-- Rooms Table Card -->
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <tr>
                  <th class="px-5 py-3.5">Habitación</th>
                  <th class="px-5 py-3.5">Piso</th>
                  <th class="px-5 py-3.5">Tipo / Categoría</th>
                  <th class="px-5 py-3.5">Tarifa Base (S/.)</th>
                  <th class="px-5 py-3.5">Estado Operativo</th>
                  <th class="px-5 py-3.5">Estado Limpieza</th>
                  <th class="px-5 py-3.5">Notas / Ubicación</th>
                  <th class="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 font-medium">
                <tr *ngFor="let room of filteredRooms()" class="hover:bg-slate-50/60 transition-colors">
                  <td class="px-5 py-4 font-black text-slate-900 text-sm">
                    <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 font-extrabold mr-2">
                      {{ room.room_number }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-bold">
                      Piso {{ room.floor }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="font-bold text-slate-800 block">{{ room.room_type?.name }}</span>
                    <span class="text-[11px] text-slate-400 font-mono">{{ room.room_type?.code }}</span>
                  </td>
                  <td class="px-5 py-4">
                    <span class="font-black text-slate-900 text-sm">
                      S/. {{ room.room_type?.base_price }}
                    </span>
                    <span class="text-[10px] text-slate-400 block">por noche</span>
                  </td>
                  <td class="px-5 py-4">
                    <app-status-badge
                      [text]="room.operational_status?.name"
                      [colorHex]="room.operational_status?.color_hex"
                      [bgHex]="room.operational_status?.badge_bg_hex"
                      [textHex]="room.operational_status?.badge_text_hex"
                      [iconName]="room.operational_status?.icon_name"
                    ></app-status-badge>
                  </td>
                  <td class="px-5 py-4">
                    <app-status-badge
                      [text]="room.housekeeping_status?.name"
                      [colorHex]="room.housekeeping_status?.color_hex"
                      [bgHex]="room.housekeeping_status?.badge_bg_hex"
                      [textHex]="room.housekeeping_status?.badge_text_hex"
                      [iconName]="room.housekeeping_status?.icon_name"
                    ></app-status-badge>
                  </td>
                  <td class="px-5 py-4 text-slate-500 max-w-xs truncate">
                    {{ room.notes || '—' }}
                  </td>
                  <td class="px-5 py-4 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        (click)="openEditRoomModal(room)"
                        class="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Editar Habitación"
                      >
                        <app-icon name="edit" [size]="16"></app-icon>
                      </button>
                      <button
                        type="button"
                        (click)="confirmDeleteRoom(room)"
                        class="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Desactivar Habitación"
                      >
                        <app-icon name="trash" [size]="16"></app-icon>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr *ngIf="filteredRooms().length === 0">
                  <td colspan="8" class="text-center py-12 text-slate-400">
                    No se encontraron habitaciones en el piso seleccionado.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <!-- ============================================== -->
      <!-- TAB 2: CATEGORÍAS & TARIFAS (PRECIOS EN SOLES) -->
      <!-- ============================================== -->
      <div *ngIf="activeTab === 'types'" class="space-y-4">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            *ngFor="let type of roomTypes()"
            class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <!-- Badge Code -->
            <div class="flex items-start justify-between mb-4">
              <div>
                <span class="inline-block px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono font-bold mb-2">
                  {{ type.code }}
                </span>
                <h3 class="text-lg font-black text-slate-900 tracking-tight">
                  {{ type.name }}
                </h3>
              </div>

              <!-- Price Badge -->
              <div class="text-right">
                <span class="text-2xl font-black text-emerald-600 block">
                  S/. {{ type.base_price }}
                </span>
                <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  por noche
                </span>
              </div>
            </div>

            <!-- Description & Details -->
            <div class="space-y-3 mb-6">
              <p class="text-xs text-slate-500 line-clamp-2">
                {{ type.description || 'Sin descripción detallada.' }}
              </p>

              <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                <div class="flex items-center gap-1.5 text-slate-700">
                  <app-icon name="user" [size]="14" class="text-amber-500"></app-icon>
                  <span>Hasta <strong>{{ type.max_capacity }}</strong> pers.</span>
                </div>
                <div class="flex items-center gap-1.5 text-slate-700">
                  <app-icon name="bed" [size]="14" class="text-amber-500"></app-icon>
                  <span class="truncate">{{ type.bed_summary || '1 Cama' }}</span>
                </div>
              </div>

              <div class="text-xs text-slate-400 pt-1">
                Habitaciones asignadas: <strong class="text-slate-800">{{ getRoomCountByType(type.id) }}</strong>
              </div>
            </div>

            <!-- Footer Action -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span class="text-[11px] text-slate-400">Tarifa configurable</span>
              
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="openEditTypeModal(type)"
                  class="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <app-icon name="edit" [size]="14" class="text-amber-400"></app-icon>
                  Editar Tarifa & Datos
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- ============================================== -->
      <!-- MODAL: NUEVA / EDITAR HABITACIÓN               -->
      <!-- ============================================== -->
      <div
        *ngIf="showRoomModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="bed" [size]="18" class="text-amber-600"></app-icon>
              {{ editingRoomId ? 'Editar Habitación' : 'Nueva Habitación' }}
            </h3>
            <button
              (click)="showRoomModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveRoom()" class="space-y-4">
            
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  N° de Habitación *
                </label>
                <input
                  type="text"
                  [(ngModel)]="roomForm.room_number"
                  name="room_number"
                  placeholder="Ej: 104, 205, PH-1"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Piso *
                </label>
                <input
                  type="number"
                  [(ngModel)]="roomForm.floor"
                  name="floor"
                  min="1"
                  max="50"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Categoría / Tarifa *
              </label>
              <app-custom-select
                [options]="typeSelectOptions"
                [(ngModel)]="roomForm.room_type_id"
                name="room_type_id"
              ></app-custom-select>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Notas / Ubicación Especial (Opcional)
              </label>
              <textarea
                [(ngModel)]="roomForm.notes"
                name="notes"
                rows="2"
                placeholder="Ej: Vista panorámica hacia el parque, alejada de ruidos."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showRoomModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="isSavingRoom"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <app-icon name="check" [size]="16" class="text-slate-950"></app-icon>
                {{ isSavingRoom ? 'Guardando...' : 'Guardar Habitación' }}
              </button>
            </div>

          </form>

        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: NUEVA / EDITAR CATEGORÍA & TARIFA      -->
      <!-- ============================================== -->
      <div
        *ngIf="showTypeModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="dollar-sign" [size]="18" class="text-emerald-600"></app-icon>
              {{ editingTypeId ? 'Editar Tarifa & Categoría' : 'Nueva Categoría de Habitación' }}
            </h3>
            <button
              (click)="showTypeModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveType()" class="space-y-4">
            
            <div class="grid grid-cols-3 gap-3">
              <div class="col-span-2">
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  [(ngModel)]="typeForm.name"
                  name="type_name"
                  placeholder="Ej: Suite Presidencial"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Código *
                </label>
                <input
                  type="text"
                  [(ngModel)]="typeForm.code"
                  name="type_code"
                  placeholder="Ej: SUI-PRES"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <!-- Tarifa Base en Soles -->
              <div class="bg-emerald-50/60 border border-emerald-200/80 p-3 rounded-2xl">
                <label class="block text-xs font-black text-emerald-900 mb-1 flex items-center gap-1">
                  <app-icon name="dollar-sign" [size]="14" class="text-emerald-600"></app-icon>
                  Tarifa Base por Noche (S/.) *
                </label>
                <input
                  type="number"
                  step="0.50"
                  [(ngModel)]="typeForm.base_price"
                  name="type_base_price"
                  min="0"
                  required
                  class="w-full px-3.5 py-2 rounded-xl border border-emerald-300 bg-white text-sm font-black text-emerald-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <!-- Capacidad Máxima -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Capacidad Máx. Huéspedes *
                </label>
                <input
                  type="number"
                  [(ngModel)]="typeForm.max_capacity"
                  name="type_max_capacity"
                  min="1"
                  max="10"
                  required
                  class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Distribución de Camas
              </label>
              <input
                type="text"
                [(ngModel)]="typeForm.bed_summary"
                name="type_bed_summary"
                placeholder="Ej: 1 Cama King Size + 1 Cama Adicional"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Descripción para Web & Huéspedes
              </label>
              <textarea
                [(ngModel)]="typeForm.description"
                name="type_description"
                rows="3"
                placeholder="Detalle de comodidad, vistas y beneficios incluidos..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showTypeModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="isSavingType"
                class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <app-icon name="check" [size]="16" class="text-amber-400"></app-icon>
                {{ isSavingType ? 'Guardando...' : 'Guardar Tarifa' }}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  `
})
export class RoomsManagerComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  activeTab: 'rooms' | 'types' = 'rooms';

  rooms = signal<any[]>([]);
  roomTypes = signal<any[]>([]);
  selectedFloor: number | null = null;

  typeSelectOptions: SelectOption[] = [];

  // Room modal state
  showRoomModal = false;
  editingRoomId: number | null = null;
  isSavingRoom = false;
  roomForm = {
    room_number: '',
    floor: 1,
    room_type_id: 1,
    notes: ''
  };

  // Room Type modal state
  showTypeModal = false;
  editingTypeId: number | null = null;
  isSavingType = false;
  typeForm = {
    name: '',
    code: '',
    base_price: 50,
    max_capacity: 2,
    bed_summary: '',
    description: ''
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.api.get<any[]>('rooms/types').subscribe({
      next: (types) => {
        this.roomTypes.set(types);
        this.typeSelectOptions = types.map((t) => ({
          value: t.id,
          label: `${t.name} (S/. ${t.base_price}/noche)`
        }));
      },
      error: () => this.toast.error('Error al cargar tipos de habitaciones')
    });

    this.api.get<any[]>('rooms').subscribe({
      next: (data) => {
        this.rooms.set(data);
      },
      error: () => this.toast.error('Error al cargar inventario de habitaciones')
    });
  }

  availableFloors(): number[] {
    const fls = this.rooms().map((r) => r.floor);
    return Array.from(new Set(fls)).sort((a, b) => a - b);
  }

  filteredRooms(): any[] {
    if (this.selectedFloor === null) return this.rooms();
    return this.rooms().filter((r) => r.floor === this.selectedFloor);
  }

  getRoomCountByType(typeId: number): number {
    return this.rooms().filter((r) => r.room_type_id === typeId).length;
  }

  // --- CRUD HABITACIONES ---
  openNewRoomModal() {
    this.editingRoomId = null;
    this.roomForm = {
      room_number: '',
      floor: 1,
      room_type_id: this.roomTypes()[0]?.id || 1,
      notes: ''
    };
    this.showRoomModal = true;
  }

  openEditRoomModal(room: any) {
    this.editingRoomId = room.id;
    this.roomForm = {
      room_number: room.room_number,
      floor: room.floor,
      room_type_id: room.room_type_id,
      notes: room.notes || ''
    };
    this.showRoomModal = true;
  }

  saveRoom() {
    if (!this.roomForm.room_number.trim()) {
      this.toast.error('El número de habitación es requerido');
      return;
    }

    this.isSavingRoom = true;
    if (this.editingRoomId) {
      // Editar
      this.api.put(`rooms/${this.editingRoomId}`, this.roomForm).subscribe({
        next: () => {
          this.toast.success(`Habitación ${this.roomForm.room_number} actualizada correctamente`);
          this.showRoomModal = false;
          this.isSavingRoom = false;
          this.loadData();
        },
        error: (err) => {
          this.isSavingRoom = false;
          this.toast.error(err?.error?.message || 'Error al actualizar habitación');
        }
      });
    } else {
      // Crear nueva
      const payload = {
        ...this.roomForm,
        operational_status_id: 1, // AVAILABLE por defecto
        housekeeping_status_id: 1, // CLEAN por defecto
        is_active: true
      };

      this.api.post('rooms', payload).subscribe({
        next: () => {
          this.toast.success(`Habitación ${this.roomForm.room_number} creada exitosamente`);
          this.showRoomModal = false;
          this.isSavingRoom = false;
          this.loadData();
        },
        error: (err) => {
          this.isSavingRoom = false;
          this.toast.error(err?.error?.message || 'Error al crear habitación');
        }
      });
    }
  }

  async confirmDeleteRoom(room: any) {
    const confirmed = await this.dialog.confirm({
      title: 'Desactivar Habitación',
      message: `¿Está seguro de que desea desactivar la habitación ${room.room_number}? Ya no aparecerá en nuevas reservas ni en el rack.`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar'
    });
    if (confirmed) {
      this.api.delete(`rooms/${room.id}`).subscribe({
        next: () => {
          this.toast.success(`Habitación ${room.room_number} desactivada`);
          this.loadData();
        },
        error: () => this.toast.error('Error al desactivar habitación')
      });
    }
  }

  // --- CRUD CATEGORÍAS & TARIFAS ---
  openNewTypeModal() {
    this.editingTypeId = null;
    this.typeForm = {
      name: '',
      code: '',
      base_price: 50,
      max_capacity: 2,
      bed_summary: '',
      description: ''
    };
    this.showTypeModal = true;
  }

  openEditTypeModal(type: any) {
    this.editingTypeId = type.id;
    this.typeForm = {
      name: type.name,
      code: type.code,
      base_price: Number(type.base_price) || 0,
      max_capacity: type.max_capacity || 2,
      bed_summary: type.bed_summary || '',
      description: type.description || ''
    };
    this.showTypeModal = true;
  }

  saveType() {
    if (!this.typeForm.name.trim() || !this.typeForm.code.trim()) {
      this.toast.error('El nombre y código de categoría son obligatorios');
      return;
    }

    if (Number(this.typeForm.base_price) <= 0) {
      this.toast.error('La tarifa base debe ser mayor a 0 Soles');
      return;
    }

    this.isSavingType = true;
    if (this.editingTypeId) {
      this.api.put(`rooms/types/${this.editingTypeId}`, this.typeForm).subscribe({
        next: () => {
          this.toast.success(`Tarifa y datos de ${this.typeForm.name} actualizados a S/. ${this.typeForm.base_price}`);
          this.showTypeModal = false;
          this.isSavingType = false;
          this.loadData();
        },
        error: (err) => {
          this.isSavingType = false;
          this.toast.error(err?.error?.message || 'Error al actualizar categoría');
        }
      });
    } else {
      this.api.post('rooms/types', this.typeForm).subscribe({
        next: () => {
          this.toast.success(`Categoría ${this.typeForm.name} creada exitosamente`);
          this.showTypeModal = false;
          this.isSavingType = false;
          this.loadData();
        },
        error: (err) => {
          this.isSavingType = false;
          this.toast.error(err?.error?.message || 'Error al crear categoría');
        }
      });
    }
  }
}
