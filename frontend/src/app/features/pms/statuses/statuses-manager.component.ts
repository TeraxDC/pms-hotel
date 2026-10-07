import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-statuses-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="space-y-8 w-full">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <app-icon name="sliders" [size]="24" class="text-amber-600"></app-icon>
          Gestor de Estados y Colores Parametrizables
        </h1>
        <p class="text-xs text-slate-500">
          Personalice los nombres, iconos y códigos de color HEX de los estados del hotel sin tocar código.
        </p>
      </div>

      <!-- TABS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          (click)="activeTab.set('operational')"
          [ngClass]="activeTab() === 'operational' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Estados Operativos (Ocupación)
        </button>

        <button
          type="button"
          (click)="activeTab.set('housekeeping')"
          [ngClass]="activeTab() === 'housekeeping' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Estados de Limpieza (Housekeeping)
        </button>

        <button
          type="button"
          (click)="activeTab.set('reservation')"
          [ngClass]="activeTab() === 'reservation' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Estados de Reservas
        </button>
      </div>

      <!-- TAB CONTENT: OPERATIONAL -->
      <div *ngIf="activeTab() === 'operational'" class="space-y-4">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="divide-y divide-slate-100">
            <div *ngFor="let item of operationalList()" class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <!-- Color preview circle -->
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                  [style.backgroundColor]="item.badge_bg_hex"
                  [style.borderColor]="item.color_hex"
                >
                  <app-icon [name]="item.icon_name || 'check-circle'" [size]="18" [style.color]="item.color_hex"></app-icon>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900">{{ item.name }}</h3>
                    <span class="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-bold">
                      {{ item.code }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>

              <!-- Color Controls & Badge Preview -->
              <div class="flex items-center gap-3">
                <app-status-badge
                  [text]="item.name"
                  [colorHex]="item.color_hex"
                  [bgHex]="item.badge_bg_hex"
                  [textHex]="item.badge_text_hex"
                  [iconName]="item.icon_name"
                ></app-status-badge>

                <button
                  type="button"
                  (click)="openEdit(item, 'operational')"
                  class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar Color & Nombre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB CONTENT: HOUSEKEEPING -->
      <div *ngIf="activeTab() === 'housekeeping'" class="space-y-4">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="divide-y divide-slate-100">
            <div *ngFor="let item of housekeepingList()" class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                  [style.backgroundColor]="item.badge_bg_hex"
                  [style.borderColor]="item.color_hex"
                >
                  <app-icon [name]="item.icon_name || 'sparkles'" [size]="18" [style.color]="item.color_hex"></app-icon>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900">{{ item.name }}</h3>
                    <span class="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-bold">
                      {{ item.code }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <app-status-badge
                  [text]="item.name"
                  [colorHex]="item.color_hex"
                  [bgHex]="item.badge_bg_hex"
                  [textHex]="item.badge_text_hex"
                  [iconName]="item.icon_name"
                ></app-status-badge>

                <button
                  type="button"
                  (click)="openEdit(item, 'housekeeping')"
                  class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar Color & Nombre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB CONTENT: RESERVATION -->
      <div *ngIf="activeTab() === 'reservation'" class="space-y-4">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs overflow-hidden">
          <div class="divide-y divide-slate-100">
            <div *ngFor="let item of reservationList()" class="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div class="flex items-center gap-4">
                <div
                  class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border"
                  [style.backgroundColor]="item.badge_bg_hex"
                  [style.borderColor]="item.color_hex"
                >
                  <app-icon [name]="item.icon_name || 'calendar'" [size]="18" [style.color]="item.color_hex"></app-icon>
                </div>

                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-sm font-bold text-slate-900">{{ item.name }}</h3>
                    <span class="text-[10px] font-mono uppercase bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-bold">
                      {{ item.code }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">{{ item.description }}</p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <app-status-badge
                  [text]="item.name"
                  [colorHex]="item.color_hex"
                  [bgHex]="item.badge_bg_hex"
                  [textHex]="item.badge_text_hex"
                  [iconName]="item.icon_name"
                ></app-status-badge>

                <button
                  type="button"
                  (click)="openEdit(item, 'reservation')"
                  class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Editar Color & Nombre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE EDICIÓN DE ESTADO Y COLOR -->
      <div
        *ngIf="editingItem()"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-900">
                Editar Estado: {{ editingItem()!.name }}
              </h3>
              <span class="text-xs text-slate-400">Código interno: {{ editingItem()!.code }}</span>
            </div>
            <button (click)="editingItem.set(null)" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nombre Visible</label>
              <input
                type="text"
                [(ngModel)]="editForm.name"
                class="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Color Principal (HEX)</label>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    [(ngModel)]="editForm.color_hex"
                    class="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    [(ngModel)]="editForm.color_hex"
                    class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Fondo Badge (HEX)</label>
                <div class="flex items-center gap-2">
                  <input
                    type="color"
                    [(ngModel)]="editForm.badge_bg_hex"
                    class="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    [(ngModel)]="editForm.badge_bg_hex"
                    class="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono uppercase"
                  />
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-600">Vista Previa:</span>
              <app-status-badge
                [text]="editForm.name"
                [colorHex]="editForm.color_hex"
                [bgHex]="editForm.badge_bg_hex"
                [textHex]="editForm.badge_text_hex"
                [iconName]="editForm.icon_name"
              ></app-status-badge>
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              (click)="editingItem.set(null)"
              class="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              (click)="saveEdit()"
              class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>

        </div>
      </div>

    </div>
  `
})
export class StatusesManagerComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  activeTab = signal<'operational' | 'housekeeping' | 'reservation'>('operational');

  operationalList = signal<any[]>([]);
  housekeepingList = signal<any[]>([]);
  reservationList = signal<any[]>([]);

  editingItem = signal<any | null>(null);
  editingType: string = '';

  editForm = {
    name: '',
    color_hex: '#10B981',
    badge_bg_hex: '#D1FAE5',
    badge_text_hex: '#065F46',
    icon_name: 'check-circle'
  };

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.api.get<any[]>('statuses/operational').subscribe((d) => this.operationalList.set(d));
    this.api.get<any[]>('statuses/housekeeping').subscribe((d) => this.housekeepingList.set(d));
    this.api.get<any[]>('statuses/reservation').subscribe((d) => this.reservationList.set(d));
  }

  openEdit(item: any, type: string) {
    this.editingItem.set(item);
    this.editingType = type;
    this.editForm = {
      name: item.name,
      color_hex: item.color_hex,
      badge_bg_hex: item.badge_bg_hex,
      badge_text_hex: item.badge_text_hex,
      icon_name: item.icon_name || 'check-circle'
    };
  }

  saveEdit() {
    const item = this.editingItem();
    if (!item) return;

    const endpoint = `statuses/${this.editingType}/${item.id}`;
    this.api.put(endpoint, this.editForm).subscribe({
      next: () => {
        this.toast.success('Estado y colores actualizados correctamente');
        this.editingItem.set(null);
        this.loadAll();
      },
      error: () => {
        this.toast.error('Error al actualizar el estado');
      }
    });
  }
}
