import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
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

        <button
          type="button"
          (click)="activeTab.set('extra_categories')"
          [ngClass]="activeTab() === 'extra_categories' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
        >
          <app-icon name="shopping-bag" [size]="15" [class.text-amber-400]="activeTab() === 'extra_categories'"></app-icon>
          Categorías de Consumos & Extras (PMS)
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

      <!-- TAB CONTENT: EXTRA CHARGE CATEGORIES (PMS) -->
      <div *ngIf="activeTab() === 'extra_categories'" class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs">
          <div>
            <h2 class="text-sm font-black text-slate-900">Catálogo Operativo de Consumos & Servicios del Hotel</h2>
            <p class="text-xs text-slate-500">
              Categorías utilizadas para registrar consumos en recepción (Minibar, Lavandería, Restaurante, etc.). Sincronizables hacia el CMS Web.
            </p>
          </div>

          <button
            type="button"
            (click)="openNewExtraCategoryModal()"
            class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <app-icon name="plus" [size]="16" class="text-slate-950"></app-icon>
            Nueva Categoría
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            *ngFor="let cat of extraCategoriesList()"
            class="p-5 bg-white rounded-3xl border border-slate-100 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                  <app-icon [name]="cat.icon_name || 'shopping-bag'" [size]="22"></app-icon>
                </div>

                <button
                  type="button"
                  (click)="toggleExtraCategoryStatus(cat)"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all border"
                  [ngClass]="cat.is_active ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'"
                >
                  <span class="w-2 h-2 rounded-full" [ngClass]="cat.is_active ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                  <span>{{ cat.is_active ? 'Activa' : 'Inactiva' }}</span>
                </button>
              </div>

              <h3 class="text-sm font-bold text-slate-900 mb-1">
                {{ cat.name }}
              </h3>
              <span class="text-[11px] text-slate-400 font-mono">
                Icono: {{ cat.icon_name || 'shopping-bag' }}
              </span>
            </div>

            <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                (click)="openEditExtraCategoryModal(cat)"
                class="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <app-icon name="edit" [size]="14"></app-icon>
                Editar
              </button>

              <button
                type="button"
                (click)="deleteExtraCategory(cat)"
                class="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Eliminar categoría"
              >
                <app-icon name="trash" [size]="15"></app-icon>
              </button>
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

      <!-- MODAL DE CREACIÓN / EDICIÓN DE CATEGORÍA DE CONSUMO (PMS) -->
      <div
        *ngIf="showExtraCategoryModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="shopping-bag" [size]="18" class="text-amber-600"></app-icon>
              {{ editingExtraCategoryId ? 'Editar Categoría de Consumo' : 'Nueva Categoría de Consumo' }}
            </h3>
            <button (click)="showExtraCategoryModal = false" class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveExtraCategory()" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">Nombre de la Categoría *</label>
              <input
                type="text"
                [(ngModel)]="extraCategoryForm.name"
                name="cat_name"
                placeholder="Ej: Frigobar, Lavandería, Restaurante, Cochera"
                required
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-2">Icono Visual</label>
              <div class="grid grid-cols-6 gap-2">
                <button
                  type="button"
                  *ngFor="let ic of availableIcons"
                  (click)="extraCategoryForm.icon_name = ic"
                  class="w-10 h-10 rounded-xl border flex items-center justify-center transition-all cursor-pointer"
                  [ngClass]="extraCategoryForm.icon_name === ic ? 'border-amber-500 bg-amber-500/10 text-amber-700 ring-2 ring-amber-500/30' : 'border-slate-200 text-slate-500 hover:bg-slate-50'"
                >
                  <app-icon [name]="ic" [size]="18"></app-icon>
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div>
                <span class="text-xs font-bold text-slate-800 block">Estado Operativo</span>
                <span class="text-[11px] text-slate-500">Disponible para asignación de cargos en folio</span>
              </div>
              <input
                type="checkbox"
                [(ngModel)]="extraCategoryForm.is_active"
                name="cat_active"
                class="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500"
              />
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showExtraCategoryModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="isSavingExtraCategory"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {{ isSavingExtraCategory ? 'Guardando...' : 'Guardar Categoría' }}
              </button>
            </div>
          </form>

        </div>
      </div>

    </div>
  `
})
export class StatusesManagerComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  activeTab = signal<'operational' | 'housekeeping' | 'reservation' | 'extra_categories'>('operational');

  operationalList = signal<any[]>([]);
  housekeepingList = signal<any[]>([]);
  reservationList = signal<any[]>([]);
  extraCategoriesList = signal<any[]>([]);

  editingItem = signal<any | null>(null);
  editingType: string = '';

  editForm = {
    name: '',
    color_hex: '#10B981',
    badge_bg_hex: '#D1FAE5',
    badge_text_hex: '#065F46',
    icon_name: 'check-circle'
  };

  // Extra categories state
  showExtraCategoryModal = false;
  editingExtraCategoryId: number | null = null;
  isSavingExtraCategory = false;
  extraCategoryForm = {
    name: '',
    icon_name: 'shopping-bag',
    is_active: true
  };
  availableIcons = ['coffee', 'sparkles', 'car', 'key', 'shopping-bag', 'phone', 'clock', 'bed', 'shield', 'wrench', 'tv', 'wifi'];

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.api.get<any[]>('statuses/operational').subscribe((d) => this.operationalList.set(d));
    this.api.get<any[]>('statuses/housekeeping').subscribe((d) => this.housekeepingList.set(d));
    this.api.get<any[]>('statuses/reservation').subscribe((d) => this.reservationList.set(d));
    this.loadExtraCategories();
  }

  loadExtraCategories() {
    this.api.get<any[]>('statuses/extra-categories/all').subscribe({
      next: (d) => this.extraCategoriesList.set(d),
      error: () => this.api.get<any[]>('statuses/extra-categories').subscribe((d) => this.extraCategoriesList.set(d))
    });
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

  openNewExtraCategoryModal() {
    this.editingExtraCategoryId = null;
    this.extraCategoryForm = {
      name: '',
      icon_name: 'shopping-bag',
      is_active: true
    };
    this.showExtraCategoryModal = true;
  }

  openEditExtraCategoryModal(cat: any) {
    this.editingExtraCategoryId = cat.id;
    this.extraCategoryForm = {
      name: cat.name,
      icon_name: cat.icon_name || 'shopping-bag',
      is_active: cat.is_active
    };
    this.showExtraCategoryModal = true;
  }

  saveExtraCategory() {
    if (!this.extraCategoryForm.name.trim()) {
      this.toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    this.isSavingExtraCategory = true;
    if (this.editingExtraCategoryId) {
      this.api.put(`statuses/extra-categories/${this.editingExtraCategoryId}`, this.extraCategoryForm).subscribe({
        next: () => {
          this.toast.success('Categoría de consumo actualizada');
          this.showExtraCategoryModal = false;
          this.isSavingExtraCategory = false;
          this.loadExtraCategories();
        },
        error: () => {
          this.isSavingExtraCategory = false;
          this.toast.error('Error al actualizar categoría');
        }
      });
    } else {
      this.api.post('statuses/extra-categories', this.extraCategoryForm).subscribe({
        next: () => {
          this.toast.success('Categoría de consumo creada');
          this.showExtraCategoryModal = false;
          this.isSavingExtraCategory = false;
          this.loadExtraCategories();
        },
        error: () => {
          this.isSavingExtraCategory = false;
          this.toast.error('Error al crear categoría');
        }
      });
    }
  }

  toggleExtraCategoryStatus(cat: any) {
    const newStatus = !cat.is_active;
    cat.is_active = newStatus;
    this.api.put(`statuses/extra-categories/${cat.id}`, { is_active: newStatus }).subscribe({
      next: () => {
        this.toast.success(`Categoría ${newStatus ? 'activada' : 'desactivada'}`);
      },
      error: () => {
        cat.is_active = !newStatus;
        this.toast.error('Error al cambiar estado');
      }
    });
  }

  async deleteExtraCategory(cat: any) {
    const confirmed = await this.dialog.confirm({
      title: 'Eliminar Categoría de Consumo',
      message: `¿Está seguro de eliminar la categoría '${cat.name}'?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      this.api.delete(`statuses/extra-categories/${cat.id}`).subscribe({
        next: () => {
          this.toast.success('Categoría eliminada');
          this.loadExtraCategories();
        },
        error: () => this.toast.error('Error al eliminar categoría')
      });
    }
  }
}
