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
    <div class="space-y-6 w-full">
      
      <!-- Top Title and Action -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <app-icon name="edit" [size]="24" class="text-amber-600"></app-icon>
            Editor de Contenido Web & Multimedia (CMS)
          </h1>
          <p class="text-xs text-slate-500">
            Administre la foto de portada principal, las fotos de cada categoría de habitación, ofertas y secciones informativas.
          </p>
        </div>

        <a
          routerLink="/"
          target="_blank"
          class="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <app-icon name="chevron-right" [size]="16" class="text-amber-400"></app-icon>
          Ver Página Pública en Vivo
        </a>
      </div>

      <!-- TABS DE NAVEGACIÓN CMS -->
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          (click)="activeTab.set('cover')"
          [ngClass]="activeTab() === 'cover' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <app-icon name="image" [size]="15" class="text-amber-400"></app-icon>
          Foto de Portada (Banner Principal)
        </button>

        <button
          type="button"
          (click)="activeTab.set('rooms')"
          [ngClass]="activeTab() === 'rooms' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <app-icon name="camera" [size]="15" class="text-amber-400"></app-icon>
          Fotos de Habitaciones (Galería)
        </button>

        <button
          type="button"
          (click)="activeTab.set('offers')"
          [ngClass]="activeTab() === 'offers' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <app-icon name="sparkles" [size]="15" class="text-amber-400"></app-icon>
          Ofertas & Promociones
        </button>

        <button
          type="button"
          (click)="activeTab.set('sections')"
          [ngClass]="activeTab() === 'sections' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          class="px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <app-icon name="sliders" [size]="15" class="text-amber-400"></app-icon>
          Secciones de Texto (Nosotros, Servicios, Contacto)
        </button>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 1: FOTO DE PORTADA WEB (HERO SECTION)                -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'cover'" class="space-y-6">
        <div class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <app-icon name="image" [size]="18" class="text-amber-600"></app-icon>
                Configuración de la Portada Principal (Hero Banner)
              </h2>
              <span class="text-xs text-slate-400">
                Esta imagen se muestra como el fondo principal del sitio web con el cotizador de reservas integrado.
              </span>
            </div>

            <button
              type="button"
              (click)="saveCoverPhoto()"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-900/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="check" [size]="16" class="text-amber-400"></app-icon>
              Guardar Portada
            </button>
          </div>

          <!-- LIVE PREVIEW CARD DE LA PORTADA -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Vista Previa en Vivo (Simulador Web)
            </label>
            <div class="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl flex items-center px-8">
              <!-- Background Image -->
              <div
                class="absolute inset-0 bg-cover bg-center transition-all duration-500 scale-100"
                [style.backgroundImage]="'url(' + (coverForm.image_url || defaultCover) + ')'"
              ></div>
              <!-- Dark overlay for contrast -->
              <div class="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/60"></div>
              
              <!-- Content Mockup -->
              <div class="relative z-10 max-w-xl text-white space-y-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-bold uppercase tracking-widest">
                  <app-icon name="sparkles" [size]="12"></app-icon>
                  Vista de Portada Activa
                </span>
                <h3 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {{ coverForm.title || 'Bienvenido a Tu Hospedaje de Ensueño' }}
                </h3>
                <p class="text-xs text-slate-300 leading-relaxed">
                  {{ coverForm.subtitle || 'Comodidad, elegancia y atención de primer nivel en el corazón de la ciudad.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- ENTRADA DE URL DE LA PORTADA -->
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL de la Imagen de Portada (JPG / PNG / WebP) *
              </label>
              <div class="flex gap-2">
                <input
                  type="url"
                  [(ngModel)]="coverForm.image_url"
                  placeholder="https://images.unsplash.com/photo-..."
                  class="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
                <button
                  type="button"
                  (click)="coverForm.image_url = defaultCover"
                  class="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  title="Restablecer a imagen predeterminada"
                >
                  Restablecer
                </button>
              </div>
            </div>

            <!-- PRESETS FOTOGRÁFICOS DE ALTA RESOLUCIÓN -->
            <div>
              <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                O seleccione una fotografía de muestra en alta resolución:
              </label>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div
                  *ngFor="let preset of coverPresets"
                  (click)="coverForm.image_url = preset.url"
                  class="p-2 bg-slate-50 rounded-xl border transition-all cursor-pointer group hover:border-amber-400"
                  [ngClass]="coverForm.image_url === preset.url ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50' : 'border-slate-200'"
                >
                  <div class="h-20 rounded-lg overflow-hidden mb-1.5 bg-slate-200">
                    <img [src]="preset.url" [alt]="preset.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span class="text-[11px] font-bold text-slate-800 block truncate">{{ preset.name }}</span>
                </div>
              </div>
            </div>

            <!-- TÍTULO Y SUBTÍTULO DEL HERO -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Título Principal del Hero
                </label>
                <input
                  type="text"
                  [(ngModel)]="coverForm.title"
                  placeholder="Tu Refugio de Descanso en la Ciudad"
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Subtítulo de Bienvenida
                </label>
                <input
                  type="text"
                  [(ngModel)]="coverForm.subtitle"
                  placeholder="Habitaciones climatizadas y atención hospitalaria personalizada..."
                  class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 2: FOTOS DE LAS HABITACIONES (GALERÍA POR CATEGORÍA) -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'rooms'" class="space-y-6">
        
        <div class="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div class="flex items-center gap-2.5">
            <app-icon name="camera" [size]="18" class="text-amber-600 shrink-0"></app-icon>
            <div>
              <span class="font-bold block">Gestor de Fotografías de Habitaciones</span>
              <span>Las fotos asignadas se exhiben inmediatamente en el catálogo interactivo de la página web pública. La primera imagen actúa como portada principal.</span>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          <div
            *ngFor="let type of roomTypes()"
            class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4"
          >
            <!-- Room Type Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded-md bg-slate-900 text-amber-400 font-mono text-[10px] font-bold">
                    {{ type.code }}
                  </span>
                  <h3 class="text-base font-black text-slate-900">
                    {{ type.name }}
                  </h3>
                  <span class="text-xs font-bold text-slate-600">
                    • S/. {{ type.base_price }}/noche
                  </span>
                </div>
                <span class="text-xs text-slate-400 mt-0.5 block">
                  {{ type.bed_summary }} • Capacidad: {{ type.max_capacity }} huésped(es)
                </span>
              </div>

              <button
                type="button"
                (click)="openAddRoomPhotoModal(type)"
                class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <app-icon name="plus" [size]="15" class="text-slate-950"></app-icon>
                + Añadir Foto
              </button>
            </div>

            <!-- Photos Grid for this Room Type -->
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div
                *ngFor="let photo of (type.photos || []); let idx = index"
                class="group relative bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex flex-col justify-between shadow-2xs"
              >
                <!-- Thumbnail -->
                <div class="h-36 overflow-hidden relative">
                  <img
                    [src]="photo"
                    [alt]="type.name + ' - Foto ' + (idx + 1)"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <!-- Primary Badge on index 0 -->
                  <div
                    *ngIf="idx === 0"
                    class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md"
                  >
                    Principal (Portada)
                  </div>
                  <div
                    *ngIf="idx > 0"
                    class="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold shadow-md"
                  >
                    Foto {{ idx + 1 }}
                  </div>
                </div>

                <!-- Action Bar -->
                <div class="p-2 bg-white flex items-center justify-between border-t border-slate-100 gap-1 text-[11px]">
                  <button
                    *ngIf="idx > 0"
                    type="button"
                    (click)="setPrimaryPhoto(type, idx)"
                    class="px-2 py-1 text-slate-600 hover:text-amber-600 font-bold transition-colors cursor-pointer truncate"
                    title="Mover como foto principal"
                  >
                    Hacer Principal
                  </button>
                  <span *ngIf="idx === 0" class="text-[10px] text-emerald-600 font-bold px-1">
                    Portada activa
                  </span>

                  <button
                    type="button"
                    (click)="deleteRoomPhoto(type, idx)"
                    class="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                    title="Eliminar foto"
                  >
                    <app-icon name="trash" [size]="14"></app-icon>
                  </button>
                </div>
              </div>

              <!-- Empty State if this room type has no photos -->
              <div
                *ngIf="!type.photos || type.photos.length === 0"
                class="col-span-full p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 space-y-2"
              >
                <app-icon name="camera" [size]="28" class="mx-auto text-slate-300"></app-icon>
                <p class="text-xs font-semibold">Esta categoría aún no tiene fotos asignadas.</p>
                <button
                  type="button"
                  (click)="openAddRoomPhotoModal(type)"
                  class="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <app-icon name="plus" [size]="14"></app-icon>
                  Subir Primera Foto
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- ======================================================== -->
      <!-- TAB 3: OFERTAS & PROMOCIONES                             -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'offers'" class="space-y-6">
        <div *ngFor="let section of getOffersSection()" class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <app-icon name="sparkles" [size]="18" class="text-amber-600"></app-icon>
                Ofertas Especiales & Promociones Web
              </h2>
              <span class="text-xs text-slate-400">
                Añade cupones de descuento y tarifas promocionales visibles en la sección #ofertas.
              </span>
            </div>

            <button
              type="button"
              (click)="openAddItemModal(section)"
              class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <app-icon name="plus" [size]="15"></app-icon>
              Nueva Oferta
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título del Módulo
              </label>
              <input
                type="text"
                [(ngModel)]="section.title"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Bajada / Subtítulo
              </label>
              <input
                type="text"
                [(ngModel)]="section.subtitle"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          <!-- Items Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
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

              <!-- Promo Code -->
              <div *ngIf="item.link_url" class="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Cupón / Ref:</span>
                <span class="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-mono font-bold text-[11px]">
                  {{ item.link_url }}
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="!section.items || section.items.length === 0" class="p-6 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl text-xs">
            Sin ofertas activas. Haga clic en "+ Nueva Oferta" para crear promociones con cupones.
          </div>
        </div>
      </div>

      <!-- ======================================================== -->
      <!-- TAB 4: OTRAS SECCIONES INFORMATIVAS                      -->
      <!-- ======================================================== -->
      <div *ngIf="activeTab() === 'sections'" class="space-y-6">
        <div
          *ngFor="let section of getGeneralSections()"
          class="bg-white rounded-3xl border border-slate-100 shadow-2xs p-6 space-y-4"
        >
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px] uppercase font-bold">
                {{ section.section_key }}
              </span>
              <h2 class="text-base font-bold text-slate-900">
                {{ section.title }}
              </h2>
            </div>

            <button
              type="button"
              (click)="saveSection(section)"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              Guardar Sección
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Título
              </label>
              <input
                type="text"
                [(ngModel)]="section.title"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Subtítulo / Bajada
              </label>
              <input
                type="text"
                [(ngModel)]="section.subtitle"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL: AÑADIR FOTO A HABITACIÓN               -->
      <!-- ============================================== -->
      <div
        *ngIf="showRoomPhotoModal && targetRoomType"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
      >
        <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 text-slate-800 animate-in zoom-in-95 duration-150">
          <div class="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
                <app-icon name="camera" [size]="18" class="text-amber-600"></app-icon>
                Añadir Foto a {{ targetRoomType.name }}
              </h3>
              <span class="text-xs text-slate-400">Pegue un enlace URL directo o seleccione una de las sugerencias</span>
            </div>
            <button
              (click)="showRoomPhotoModal = false"
              class="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="space-y-4">
            <!-- Preview if input present -->
            <div *ngIf="newPhotoUrl" class="h-44 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img [src]="newPhotoUrl" alt="Vista previa" class="w-full h-full object-cover" />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                URL de la Imagen *
              </label>
              <input
                type="url"
                [(ngModel)]="newPhotoUrl"
                placeholder="https://images.unsplash.com/photo-..."
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <!-- Presets -->
            <div>
              <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Sugerencias Fotográficas Profesionales:
              </label>
              <div class="grid grid-cols-3 gap-2">
                <div
                  *ngFor="let sample of roomSamplePresets"
                  (click)="newPhotoUrl = sample.url"
                  class="p-1.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-amber-400 transition-colors cursor-pointer group"
                >
                  <div class="h-14 rounded-lg overflow-hidden bg-slate-200 mb-1">
                    <img [src]="sample.url" [alt]="sample.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <span class="text-[10px] font-bold text-slate-700 block truncate">{{ sample.name }}</span>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                (click)="showRoomPhotoModal = false"
                class="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmAddRoomPhoto()"
                [disabled]="!newPhotoUrl.trim()"
                class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <app-icon name="check" [size]="16"></app-icon>
                Guardar Foto en Habitación
              </button>
            </div>
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
                placeholder="Describa el descuento o condiciones aplicables..."
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

  activeTab = signal<'cover' | 'rooms' | 'offers' | 'sections'>('cover');

  sections = signal<any[]>([]);
  roomTypes = signal<any[]>([]);

  // Default and presets for Cover Photo
  defaultCover = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80';
  coverPresets = [
    { name: 'Hotel Boutique & Lujo', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80' },
    { name: 'Vista Nocturna & Luces', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80' },
    { name: 'Lobby & Descanso Confort', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=80' },
    { name: 'Resort & Suites Modernas', url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1600&q=80' },
  ];

  coverForm = {
    title: '',
    subtitle: '',
    image_url: ''
  };

  // Room Photos Modal State
  showRoomPhotoModal = false;
  targetRoomType: any = null;
  newPhotoUrl = '';
  roomSamplePresets = [
    { name: 'Habitación Matrimonial', url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80' },
    { name: 'Habitación Simple', url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80' },
    { name: 'Habitación Doble', url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Suite Ejecutiva', url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
    { name: 'Baño de Lujo', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80' },
    { name: 'Balcón / Terraza', url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80' }
  ];

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
    this.loadRoomTypes();
  }

  loadSections() {
    this.api.get<any[]>('cms/sections').subscribe({
      next: (data) => {
        this.sections.set(data);
        const hero = data.find((s) => s.section_key === 'hero');
        if (hero) {
          this.coverForm.title = hero.title;
          this.coverForm.subtitle = hero.subtitle;
          const coverItem = hero.items?.find((i: any) => i.image_url) || hero.items?.[0];
          this.coverForm.image_url = coverItem?.image_url || this.defaultCover;
        }
      },
      error: () => this.toast.error('No se pudo cargar el contenido del CMS')
    });
  }

  loadRoomTypes() {
    this.api.get<any[]>('rooms/types').subscribe({
      next: (types) => this.roomTypes.set(types),
      error: () => this.toast.error('No se pudieron cargar las categorías de habitaciones')
    });
  }

  getOffersSection(): any[] {
    return this.sections().filter((s) => s.section_key === 'offers');
  }

  getGeneralSections(): any[] {
    return this.sections().filter((s) => s.section_key !== 'offers' && s.section_key !== 'hero');
  }

  saveCoverPhoto() {
    const hero = this.sections().find((s) => s.section_key === 'hero');
    if (!hero) {
      this.toast.error('Sección Hero no encontrada');
      return;
    }

    // 1. Actualizar títulos de la sección hero
    this.api.put(`cms/sections/${hero.id}`, {
      title: this.coverForm.title,
      subtitle: this.coverForm.subtitle
    }).subscribe({
      next: () => {
        // 2. Actualizar o crear ítem con la foto de portada
        const existingCoverItem = hero.items?.find((i: any) => i.image_url) || hero.items?.[0];
        if (existingCoverItem) {
          this.api.put(`cms/items/${existingCoverItem.id}`, {
            title: 'Foto de Portada Principal',
            image_url: this.coverForm.image_url || this.defaultCover
          }).subscribe({
            next: () => {
              this.toast.success('Foto de portada actualizada exitosamente');
              this.loadSections();
            },
            error: () => this.toast.error('Error al guardar la foto de portada')
          });
        } else {
          this.api.post('cms/items', {
            section_id: hero.id,
            title: 'Foto de Portada Principal',
            image_url: this.coverForm.image_url || this.defaultCover,
            display_order: 1,
            is_active: true
          }).subscribe({
            next: () => {
              this.toast.success('Foto de portada registrada exitosamente');
              this.loadSections();
            },
            error: () => this.toast.error('Error al guardar la foto de portada')
          });
        }
      },
      error: () => this.toast.error('Error al actualizar textos de la portada')
    });
  }

  openAddRoomPhotoModal(type: any) {
    this.targetRoomType = type;
    this.newPhotoUrl = '';
    this.showRoomPhotoModal = true;
  }

  confirmAddRoomPhoto() {
    if (!this.newPhotoUrl.trim() || !this.targetRoomType) return;

    const currentPhotos = [...(this.targetRoomType.photos || [])];
    currentPhotos.push(this.newPhotoUrl.trim());

    this.api.put(`rooms/types/${this.targetRoomType.id}`, {
      photos: currentPhotos
    }).subscribe({
      next: () => {
        this.toast.success(`Foto añadida a ${this.targetRoomType.name}`);
        this.showRoomPhotoModal = false;
        this.newPhotoUrl = '';
        this.loadRoomTypes();
      },
      error: () => this.toast.error('Error al guardar la foto de la habitación')
    });
  }

  deleteRoomPhoto(type: any, index: number) {
    const currentPhotos = [...(type.photos || [])];
    currentPhotos.splice(index, 1);

    this.api.put(`rooms/types/${type.id}`, {
      photos: currentPhotos
    }).subscribe({
      next: () => {
        this.toast.success('Foto eliminada');
        this.loadRoomTypes();
      },
      error: () => this.toast.error('Error al eliminar la foto')
    });
  }

  setPrimaryPhoto(type: any, index: number) {
    const currentPhotos = [...(type.photos || [])];
    const selected = currentPhotos.splice(index, 1)[0];
    currentPhotos.unshift(selected);

    this.api.put(`rooms/types/${type.id}`, {
      photos: currentPhotos
    }).subscribe({
      next: () => {
        this.toast.success('Foto establecida como principal');
        this.loadRoomTypes();
      },
      error: () => this.toast.error('Error al actualizar foto principal')
    });
  }

  saveSection(section: any) {
    this.api.put(`cms/sections/${section.id}`, {
      title: section.title,
      subtitle: section.subtitle
    }).subscribe({
      next: () => {
        this.toast.success(`Sección '${section.title}' guardada`);
        this.loadSections();
      },
      error: () => this.toast.error('Error al guardar sección')
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
          this.toast.success('Oferta actualizada correctamente');
          this.showItemModal = false;
          this.isSavingItem = false;
          this.loadSections();
        },
        error: () => {
          this.isSavingItem = false;
          this.toast.error('Error al actualizar oferta');
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
          this.toast.success('Nueva oferta creada');
          this.showItemModal = false;
          this.isSavingItem = false;
          this.loadSections();
        },
        error: () => {
          this.isSavingItem = false;
          this.toast.error('Error al crear oferta');
        }
      });
    }
  }

  async deleteItem(item: any) {
    const confirmed = await this.dialog.confirm({
      title: 'Eliminar Oferta',
      message: `¿Está seguro de eliminar '${item.title}'?`,
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    });
    if (confirmed) {
      this.api.delete(`cms/items/${item.id}`).subscribe({
        next: () => {
          this.toast.success('Oferta eliminada');
          this.loadSections();
        },
        error: () => this.toast.error('Error al eliminar elemento')
      });
    }
  }
}
