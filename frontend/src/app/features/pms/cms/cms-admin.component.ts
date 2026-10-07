import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { DialogService } from '../../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pms-cms-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-5xl">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="edit" [size]="24" class="text-amber-600"></app-icon>
            Editor de Contenido Web & Ofertas (CMS)
          </h1>
          <p class="text-xs text-slate-500">
            Administre textos informativos, amenidades y las ofertas / promociones que se muestran en el portal público.
          </p>
        </div>

        <a
          routerLink="/"
          target="_blank"
          class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <app-icon name="chevron-right" [size]="16" class="text-amber-400"></app-icon>
          Ver Página en Vivo
        </a>
      </div>

      <!-- SECTIONS LIST -->
      <div class="space-y-6">
        <div *ngFor="let section of sections()" class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2.5">
              <span
                class="px-2.5 py-0.5 rounded-md font-mono text-[10px] uppercase font-bold"
                [ngClass]="section.section_key === 'offers' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800'"
              >
                {{ section.section_key }}
              </span>
              <h2 class="text-base font-bold text-slate-900">
                {{ section.title }}
              </h2>
            </div>

            <div class="flex items-center gap-2">
              <button
                *ngIf="section.section_key === 'offers' || section.section_key === 'amenities'"
                type="button"
                (click)="openAddItemModal(section)"
                class="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <app-icon name="plus" [size]="14"></app-icon>
                {{ section.section_key === 'offers' ? 'Nueva Oferta' : 'Nuevo Ítem' }}
              </button>

              <button
                type="button"
                (click)="saveSection(section)"
                class="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Guardar Títulos
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título de la Sección
              </label>
              <input
                type="text"
                [(ngModel)]="section.title"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtítulo / Bajada
              </label>
              <input
                type="text"
                [(ngModel)]="section.subtitle"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <!-- ITEMS SUBSECTION (FOR OFFERS OR AMENITIES) -->
          <div *ngIf="section.items && section.items.length > 0" class="pt-3 border-t border-slate-100">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              {{ section.section_key === 'offers' ? 'Promociones y Cupones Activos' : 'Elementos Destacados' }}
            </h4>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div
                *ngFor="let item of section.items"
                class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col justify-between hover:border-amber-300 transition-colors group relative"
              >
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-amber-600 flex items-center justify-center shrink-0">
                        <app-icon [name]="item.icon_name || 'sparkles'" [size]="16"></app-icon>
                      </div>
                      <h5 class="text-xs font-black text-slate-900">{{ item.title }}</h5>
                    </div>

                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        (click)="openEditItemModal(section, item)"
                        class="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-white transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <app-icon name="edit" [size]="14"></app-icon>
                      </button>
                      <button
                        type="button"
                        (click)="deleteItem(item)"
                        class="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <app-icon name="trash" [size]="14"></app-icon>
                      </button>
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-600 leading-relaxed mb-3">
                    {{ item.content }}
                  </p>
                </div>

                <!-- Footer with Promo Code if Section is Offers -->
                <div *ngIf="item.link_url" class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span class="text-[10px] text-slate-400 uppercase font-bold">Cupón / Ref:</span>
                  <span class="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-[11px]">
                    {{ item.link_url }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="section.section_key === 'offers' && (!section.items || section.items.length === 0)" class="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
            No hay ofertas activas creadas. Haga clic en "+ Nueva Oferta" para agregar promociones especiales.
          </div>

        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: NUEVO / EDITAR ÍTEM / OFERTA            -->
      <!-- ============================================== -->
      <div
        *ngIf="showItemModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <app-icon name="sparkles" [size]="18" class="text-amber-600"></app-icon>
              {{ editingItemId ? 'Editar Oferta / Elemento' : 'Nueva Oferta / Promoción' }}
            </h3>
            <button
              (click)="showItemModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <form (ngSubmit)="saveItem()" class="space-y-4">
            
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Título de la Oferta / Promoción *
              </label>
              <input
                type="text"
                [(ngModel)]="itemForm.title"
                name="item_title"
                placeholder="Ej: Escapada Fin de Semana - 20% OFF"
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Código Promocional / Cupón (Opcional)
              </label>
              <input
                type="text"
                [(ngModel)]="itemForm.link_url"
                name="item_link_url"
                placeholder="Ej: PROMO-FINDE, VERANO2026, CORP-20"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold uppercase focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Descripción del Beneficio *
              </label>
              <textarea
                [(ngModel)]="itemForm.content"
                name="item_content"
                rows="3"
                placeholder="Describa el descuento o condiciones aplicables (ej: Válido de viernes a domingo en hab. matrimonial)..."
                required
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:border-amber-500 focus:outline-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1">
                Ícono Ilustrativo
              </label>
              <select
                [(ngModel)]="itemForm.icon_name"
                name="item_icon"
                class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:border-amber-500 focus:outline-none"
              >
                <option value="sparkles">Destacado (Chispas)</option>
                <option value="calendar">Calendario (Fechas)</option>
                <option value="shield">Seguridad / Garantía</option>
                <option value="star">Estrella (Calidad)</option>
                <option value="award">Premio / Descuento</option>
                <option value="key">Llave / Hospedaje</option>
                <option value="users">Grupo / Familia</option>
              </select>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showItemModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                [disabled]="isSavingItem"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <app-icon name="check" [size]="16" class="text-slate-950"></app-icon>
                {{ isSavingItem ? 'Guardando...' : 'Guardar Oferta' }}
              </button>
            </div>

          </form>

        </div>
      </div>

    </div>
  `
})
export class CmsAdminComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);

  sections = signal<any[]>([]);

  // Item Modal State
  showItemModal = false;
  editingItemId: number | null = null;
  targetSectionId: number = 0;
  isSavingItem = false;
  itemForm = {
    title: '',
    content: '',
    link_url: '',
    icon_name: 'sparkles'
  };

  ngOnInit() {
    this.loadSections();
  }

  loadSections() {
    this.api.get<any[]>('cms/sections').subscribe({
      next: (data) => this.sections.set(data),
      error: () => this.toast.error('No se pudo cargar el contenido del CMS')
    });
  }

  saveSection(section: any) {
    this.api.put(`cms/sections/${section.id}`, {
      title: section.title,
      subtitle: section.subtitle
    }).subscribe({
      next: () => {
        this.toast.success(`Sección '${section.title}' actualizada exitosamente`);
        this.loadSections();
      },
      error: () => this.toast.error('Error al guardar la sección')
    });
  }

  openAddItemModal(section: any) {
    this.editingItemId = null;
    this.targetSectionId = section.id;
    this.itemForm = {
      title: '',
      content: '',
      link_url: '',
      icon_name: 'sparkles'
    };
    this.showItemModal = true;
  }

  openEditItemModal(section: any, item: any) {
    this.editingItemId = item.id;
    this.targetSectionId = section.id;
    this.itemForm = {
      title: item.title,
      content: item.content || '',
      link_url: item.link_url || '',
      icon_name: item.icon_name || 'sparkles'
    };
    this.showItemModal = true;
  }

  saveItem() {
    if (!this.itemForm.title.trim()) {
      this.toast.error('El título es requerido');
      return;
    }

    this.isSavingItem = true;
    if (this.editingItemId) {
      this.api.put(`cms/items/${this.editingItemId}`, this.itemForm).subscribe({
        next: () => {
          this.toast.success('Elemento actualizado correctamente');
          this.showItemModal = false;
          this.isSavingItem = false;
          this.loadSections();
        },
        error: () => {
          this.isSavingItem = false;
          this.toast.error('Error al actualizar el elemento');
        }
      });
    } else {
      const payload = {
        ...this.itemForm,
        section_id: this.targetSectionId,
        display_order: 1,
        is_active: true
      };
      this.api.post('cms/items', payload).subscribe({
        next: () => {
          this.toast.success('Nueva oferta/elemento creado exitosamente');
          this.showItemModal = false;
          this.isSavingItem = false;
          this.loadSections();
        },
        error: () => {
          this.isSavingItem = false;
          this.toast.error('Error al crear el elemento');
        }
      });
    }
  }

  async deleteItem(item: any) {
    const confirmed = await this.dialog.confirm({
      title: 'Eliminar Elemento',
      message: `¿Está seguro de eliminar '${item.title}'?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    if (confirmed) {
      this.api.delete(`cms/items/${item.id}`).subscribe({
        next: () => {
          this.toast.success('Elemento eliminado');
          this.loadSections();
        },
        error: () => this.toast.error('Error al eliminar elemento')
      });
    }
  }
}
