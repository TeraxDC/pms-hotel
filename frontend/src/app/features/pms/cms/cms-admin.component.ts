import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../../shared/components/custom-select/custom-select.component';

@Component({
  selector: 'app-pms-cms-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-5xl">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="edit" [size]="24" class="text-amber-600"></app-icon>
            Editor de Contenido Web (CMS)
          </h1>
          <p class="text-xs text-slate-500">
            Administre los textos principales, banners y amenidades de la página web pública.
          </p>
        </div>

        <a
          routerLink="/"
          target="_blank"
          class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 self-start sm:self-auto"
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
              <span class="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 font-mono text-[10px] uppercase font-bold">
                {{ section.section_key }}
              </span>
              <h2 class="text-base font-bold text-slate-900">
                {{ section.title }}
              </h2>
            </div>

            <button
              type="button"
              (click)="saveSection(section)"
              class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Guardar Cambios
            </button>
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

          <!-- ITEMS SUBSECTION (IF AMENITIES OR GALLERY) -->
          <div *ngIf="section.items && section.items.length > 0" class="pt-3 border-t border-slate-100">
            <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Elementos Destacados</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div *ngFor="let item of section.items" class="p-3 bg-slate-50 rounded-xl border border-slate-200/60 flex items-start gap-2.5">
                <div class="w-8 h-8 rounded-lg bg-white border border-slate-200 text-amber-600 flex items-center justify-center shrink-0">
                  <app-icon [name]="item.icon_name || 'sparkles'" [size]="16"></app-icon>
                </div>
                <div class="flex-1 min-w-0">
                  <h5 class="text-xs font-bold text-slate-900 truncate">{{ item.title }}</h5>
                  <p class="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{{ item.content }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CmsAdminComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  sections = signal<any[]>([]);

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
}
