import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../../core/services/auth.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-hotel-info',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto pb-12">

      <!-- HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-900 border border-amber-500/30 flex items-center gap-1.5">
              <app-icon name="shield" [size]="12" class="text-amber-600"></app-icon>
              Exclusivo Superadministrador
            </span>
            <span class="text-xs font-semibold text-slate-400">• Configuración Institucional</span>
          </div>
          <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <app-icon name="building" [size]="26" class="text-amber-600"></app-icon>
            Información del Hospedaje
          </h1>
          <p class="text-xs text-slate-500 mt-0.5">
            Gestione la identidad legal, datos comerciales, horarios oficiales de entrada/salida y políticas institucionales del establecimiento.
          </p>
        </div>

        <button
          type="button"
          (click)="saveHotelInfo()"
          [disabled]="isSaving()"
          class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <app-icon *ngIf="!isSaving()" name="save" [size]="16" class="text-slate-950"></app-icon>
          <span *ngIf="isSaving()">Guardando cambios...</span>
          <span *ngIf="!isSaving()">Guardar Configuración</span>
        </button>
      </div>

      <!-- LIVE PREVIEW BANNER -->
      <div class="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div class="absolute -right-8 -bottom-8 opacity-5 text-slate-100 pointer-events-none">
          <app-icon name="building" [size]="200"></app-icon>
        </div>

        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-start sm:items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xs flex items-center justify-center text-amber-400 overflow-hidden shrink-0 shadow-inner">
              <img
                *ngIf="hotelForm.logo_url; else defaultLogo"
                [src]="hotelForm.logo_url"
                [alt]="hotelForm.hotel_name"
                class="w-full h-full object-contain p-1"
              />
              <ng-template #defaultLogo>
                <app-icon name="building" [size]="32"></app-icon>
              </ng-template>
            </div>

            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-xl font-black text-white tracking-tight">
                  {{ hotelForm.hotel_name || 'Nombre del Hotel' }}
                </h2>
                <span class="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                  RUC: {{ hotelForm.tax_id || 'Sin registrar' }}
                </span>
              </div>
              <p class="text-xs text-slate-300 font-medium mt-0.5">
                {{ hotelForm.trade_name || 'Razón Social no especificada' }}
              </p>
              <div class="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-[11px] text-slate-400">
                <span class="flex items-center gap-1">
                  <app-icon name="map-pin" [size]="12" class="text-amber-400"></app-icon>
                  {{ hotelForm.address || 'Dirección no definida' }}, {{ hotelForm.city || 'Ciudad' }} ({{ hotelForm.country || 'Perú' }})
                </span>
                <span class="flex items-center gap-1">
                  <app-icon name="phone" [size]="12" class="text-amber-400"></app-icon>
                  {{ hotelForm.phone || hotelForm.whatsapp || 'Sin teléfono' }}
                </span>
              </div>
            </div>
          </div>

          <div class="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs shrink-0 flex items-center gap-6">
            <div class="text-center">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Check-In Oficial</span>
              <span class="text-base font-black text-amber-400 font-mono">{{ hotelForm.check_in_time || '14:00' }}</span>
            </div>
            <div class="w-px h-8 bg-white/10"></div>
            <div class="text-center">
              <span class="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Check-Out Oficial</span>
              <span class="text-base font-black text-amber-400 font-mono">{{ hotelForm.check_out_time || '11:00' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FORM SECTIONS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- CARD 1: IDENTIDAD LEGAL Y COMERCIAL -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <app-icon name="file-text" [size]="16"></app-icon>
            </div>
            <h3 class="text-sm font-bold text-slate-900">1. Identidad Legal & Marca</h3>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Nombre Comercial del Hospedaje *</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.hotel_name"
              placeholder="Ej: Hotel San Juan Bautista"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Razón Social / Titular Legal *</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.trade_name"
              placeholder="Ej: Inversiones Hoteleras SJB S.A.C."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">RUC / Registro Tributario *</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.tax_id"
              maxlength="20"
              placeholder="Ej: 20601234567"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">URL del Logo Institucional</label>
            <input
              type="url"
              [(ngModel)]="hotelForm.logo_url"
              placeholder="https://ejemplo.com/logo.png"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
            <span class="text-[11px] text-slate-400 mt-1 block">Visible en comprobantes, folios y portal web.</span>
          </div>
        </div>

        <!-- CARD 2: CONTACTO Y CANALES DIRECTOS -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <app-icon name="phone" [size]="16"></app-icon>
            </div>
            <h3 class="text-sm font-bold text-slate-900">2. Canales de Contacto Directo</h3>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">WhatsApp Oficial para Reservas *</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.whatsapp"
              placeholder="Ej: +51 984123456"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
            <span class="text-[11px] text-slate-400 mt-1 block">Número donde los huéspedes envían sus cotizaciones directas.</span>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Teléfono Fijo / Central Telefónica</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.phone"
              placeholder="Ej: +51 84 234567"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Correo Electrónico de Reservas / Recepción *</label>
            <input
              type="email"
              [(ngModel)]="hotelForm.email"
              placeholder="contacto@hotelsjb.com"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <!-- CARD 3: UBICACIÓN GEOGRÁFICA -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <app-icon name="map-pin" [size]="16"></app-icon>
            </div>
            <h3 class="text-sm font-bold text-slate-900">3. Ubicación del Establecimiento</h3>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Dirección Completa *</label>
            <input
              type="text"
              [(ngModel)]="hotelForm.address"
              placeholder="Ej: Av. El Sol 345, Cercado"
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Ciudad *</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.city"
                placeholder="Ej: Cusco"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">País *</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.country"
                placeholder="Ej: Perú"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Latitud GPS</label>
              <input
                type="number"
                step="0.000001"
                [(ngModel)]="hotelForm.latitude"
                placeholder="-13.518600"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Longitud GPS</label>
              <input
                type="number"
                step="0.000001"
                [(ngModel)]="hotelForm.longitude"
                placeholder="-71.977200"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Zoom del Mapa</label>
              <input
                type="number"
                min="10"
                max="19"
                [(ngModel)]="hotelForm.map_zoom"
                placeholder="16"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <!-- CARD 4: HORARIOS Y POLÍTICAS OPERATIVAS -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div class="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <app-icon name="clock" [size]="16"></app-icon>
            </div>
            <h3 class="text-sm font-bold text-slate-900">4. Horarios y Políticas Operativas</h3>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Hora Check-In Oficial *</label>
              <input
                type="time"
                [(ngModel)]="hotelForm.check_in_time"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Estándar: 14:00 (2:00 PM)</span>
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Hora Check-Out Oficial *</label>
              <input
                type="time"
                [(ngModel)]="hotelForm.check_out_time"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
              />
              <span class="text-[10px] text-slate-400 mt-1 block">Estándar: 11:00 o 12:00 PM</span>
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1.5">Política Institucional de Cancelación</label>
            <textarea
              [(ngModel)]="hotelForm.cancellation_policy"
              rows="3"
              placeholder="Ej: Cancelaciones sin penalidad con 24 horas de anticipación a la fecha de ingreso..."
              class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white transition-all"
            ></textarea>
          </div>
        </div>

        <!-- CARD 5: PARÁMETROS FISCALES Y MONEDA -->
        <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-2xs space-y-4 md:col-span-2">
          <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <app-icon name="dollar-sign" [size]="16"></app-icon>
            </div>
            <h3 class="text-sm font-bold text-slate-900">5. Moneda y Parámetros Fiscales</h3>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Moneda del Sistema</label>
              <div class="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>PEN - Soles Peruanos</span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Símbolo Monetario</label>
              <div class="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800">
                S/.
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Nombre del Impuesto</label>
              <input
                type="text"
                [(ngModel)]="hotelForm.tax_name"
                placeholder="IGV"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-700 mb-1.5">Tasa Porcentual (%)</label>
              <input
                type="number"
                step="0.01"
                [(ngModel)]="hotelForm.tax_percentage"
                placeholder="18.00"
                class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>
        </div>

      </div>

      <!-- FOOTER SAVE BAR -->
      <div class="pt-4 flex items-center justify-between">
        <p class="text-xs text-slate-400">
          * Los cambios guardados se reflejan inmediatamente en la web informativa, en los folios de huéspedes y en el panel PMS.
        </p>
        <button
          type="button"
          (click)="saveHotelInfo()"
          [disabled]="isSaving()"
          class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-50 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
        >
          <app-icon *ngIf="!isSaving()" name="save" [size]="16"></app-icon>
          <span *ngIf="isSaving()">Guardando cambios...</span>
          <span *ngIf="!isSaving()">Guardar Configuración Institucional</span>
        </button>
      </div>

    </div>
  `
})
export class HotelInfoComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);

  isSaving = signal<boolean>(false);

  hotelForm: any = {
    hotel_name: '',
    trade_name: '',
    tax_id: '',
    address: '',
    city: 'Cusco',
    country: 'Perú',
    phone: '',
    whatsapp: '',
    email: '',
    logo_url: '',
    favicon_url: '',
    primary_currency: 'PEN',
    currency_symbol: 'S/.',
    tax_name: 'IGV',
    tax_percentage: 18.0,
    check_in_time: '14:00',
    check_out_time: '11:00',
    cancellation_policy: '',
    latitude: -13.518600,
    longitude: -71.977200,
    map_zoom: 16
  };

  ngOnInit() {
    this.loadHotelSettings();
  }

  loadHotelSettings() {
    this.api.get<any>('hotel/settings').subscribe({
      next: (res) => {
        if (res) {
          this.hotelForm = {
            ...this.hotelForm,
            ...res,
            primary_currency: res.primary_currency || 'PEN',
            currency_symbol: res.currency_symbol || 'S/.',
            tax_percentage: Number(res.tax_percentage || 18.0),
            latitude: res.latitude !== undefined && res.latitude !== null ? Number(res.latitude) : -13.518600,
            longitude: res.longitude !== undefined && res.longitude !== null ? Number(res.longitude) : -71.977200,
            map_zoom: res.map_zoom ? Number(res.map_zoom) : 16
          };
        }
      },
      error: () => {
        this.toast.error('No se pudo cargar la configuración del hotel.');
      }
    });
  }

  saveHotelInfo() {
    if (!this.hotelForm.hotel_name?.trim()) {
      this.toast.warning('El nombre del hospedaje es obligatorio.');
      return;
    }
    if (!this.hotelForm.whatsapp?.trim() && !this.hotelForm.phone?.trim()) {
      this.toast.warning('Debe ingresar al menos un número telefónico o WhatsApp de contacto.');
      return;
    }

    this.isSaving.set(true);
    this.api.put('hotel/settings', this.hotelForm).subscribe({
      next: (saved: any) => {
        this.isSaving.set(false);
        this.toast.success('Información del hospedaje guardada exitosamente.');
        if (saved) {
          this.hotelForm = {
            ...this.hotelForm,
            ...saved,
            primary_currency: 'PEN',
            currency_symbol: 'S/.',
            tax_percentage: Number(saved.tax_percentage || 18.0)
          };
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toast.error(err?.error?.message || 'Error al guardar la información del hotel.');
      }
    });
  }
}
