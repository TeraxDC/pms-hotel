import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { DialogService } from '../../shared/components/dialog/dialog.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CustomSelectComponent, SelectOption } from '../../shared/components/custom-select/custom-select.component';
import { CustomCheckboxComponent } from '../../shared/components/custom-checkbox/custom-checkbox.component';

@Component({
  selector: 'app-setup-wizard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    CustomSelectComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <!-- Background Decorative Grid -->
      <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-2xl relative z-10">
        <!-- Logo and Brand Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-lg shadow-amber-500/10">
            <app-icon name="building" [size]="28"></app-icon>
          </div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">
            hotelSJB — Asistente de Inicialización
          </h1>
          <p class="mt-2 text-sm text-slate-400">
            Configure los datos esenciales del establecimiento para comenzar a operar.
          </p>
        </div>

        <!-- Stepper Indicators -->
        <div class="mb-8 flex items-center justify-between px-6 max-w-lg mx-auto">
          <div class="flex items-center gap-2">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
              [ngClass]="step() >= 1 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'"
            >
              1
            </div>
            <span class="text-xs font-semibold" [ngClass]="step() >= 1 ? 'text-amber-400' : 'text-slate-500'">Hotel</span>
          </div>
          <div class="h-0.5 w-12" [ngClass]="step() >= 2 ? 'bg-amber-500' : 'bg-slate-800'"></div>
          <div class="flex items-center gap-2">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
              [ngClass]="step() >= 2 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'"
            >
              2
            </div>
            <span class="text-xs font-semibold" [ngClass]="step() >= 2 ? 'text-amber-400' : 'text-slate-500'">Operaciones</span>
          </div>
          <div class="h-0.5 w-12" [ngClass]="step() >= 3 ? 'bg-amber-500' : 'bg-slate-800'"></div>
          <div class="flex items-center gap-2">
            <div
              class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-colors"
              [ngClass]="step() >= 3 ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400 border border-slate-700'"
            >
              3
            </div>
            <span class="text-xs font-semibold" [ngClass]="step() >= 3 ? 'text-amber-400' : 'text-slate-500'">Superadmin</span>
          </div>
        </div>

        <!-- Main Card Container -->
        <div class="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-2xl text-slate-200">
          
          <!-- STEP 1: Datos de Identidad y Ubicación -->
          <div *ngIf="step() === 1" class="space-y-5 animate-in fade-in duration-200">
            <div class="border-b border-slate-700/60 pb-3 mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <app-icon name="building" [size]="18" class="text-amber-400"></app-icon>
                Identidad del Establecimiento
              </h2>
              <p class="text-xs text-slate-400">Datos principales que se mostrarán en la web pública y comprobantes.</p>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nombre Comercial del Hotel *
              </label>
              <input
                type="text"
                [(ngModel)]="formData.hotel_name"
                placeholder="Ej. Hotel San Juan Bautista"
                class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Razón Social / Propietario
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.trade_name"
                  placeholder="Ej. Inversiones Hoteleras SJB S.A.C."
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  RUC / Identificación Fiscal
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.tax_id"
                  placeholder="Ej. 20601234567"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Dirección Física
              </label>
              <input
                type="text"
                [(ngModel)]="formData.address"
                placeholder="Ej. Av. Principal 456, Centro Histórico"
                class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ciudad
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.city"
                  placeholder="Ej. Cusco"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  País
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.country"
                  placeholder="Ej. Perú"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                URL de Logotipo (Opcional)
              </label>
              <input
                type="text"
                [(ngModel)]="formData.logo_url"
                placeholder="https://tudominio.com/logo.png"
                class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>
          </div>

          <!-- STEP 2: Canales de Contacto y Parámetros Operativos -->
          <div *ngIf="step() === 2" class="space-y-5 animate-in fade-in duration-200">
            <div class="border-b border-slate-700/60 pb-3 mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <app-icon name="sliders" [size]="18" class="text-amber-400"></app-icon>
                Contacto y Parámetros Operativos
              </h2>
              <p class="text-xs text-slate-400">Canales de reserva y horarios oficiales de entrada y salida.</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  WhatsApp Directo de Reservas *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <app-icon name="phone" [size]="16"></app-icon>
                  </div>
                  <input
                    type="text"
                    [(ngModel)]="formData.whatsapp"
                    placeholder="+51 987654321"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Correo Electrónico Oficial *
                </label>
                <input
                  type="email"
                  [(ngModel)]="formData.email"
                  placeholder="reservas@hotelsjb.com"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Moneda Principal
                </label>
                <app-custom-select
                  [options]="currencyOptions"
                  [(ngModel)]="formData.primary_currency"
                  (selectionChange)="onCurrencyChange($event)"
                ></app-custom-select>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  [(ngModel)]="formData.currency_symbol"
                  placeholder="$ o S/"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hora Estándar de Check-In
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <app-icon name="clock" [size]="16"></app-icon>
                  </div>
                  <input
                    type="time"
                    [(ngModel)]="formData.check_in_time"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Hora Estándar de Check-Out
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <app-icon name="clock" [size]="16"></app-icon>
                  </div>
                  <input
                    type="time"
                    [(ngModel)]="formData.check_out_time"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-hidden focus:border-amber-500 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- STEP 3: Creación del Superadministrador -->
          <div *ngIf="step() === 3" class="space-y-5 animate-in fade-in duration-200">
            <div class="border-b border-slate-700/60 pb-3 mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <app-icon name="shield" [size]="18" class="text-amber-400"></app-icon>
                Cuenta del Superadministrador Maestro
              </h2>
              <p class="text-xs text-slate-400">Esta cuenta tendrá control absoluto sobre usuarios, permisos y configuración.</p>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Nombre Completo del Administrador *
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <app-icon name="user" [size]="16"></app-icon>
                </div>
                <input
                  type="text"
                  [(ngModel)]="formData.admin_name"
                  placeholder="Ej. Administrador Principal"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Correo Electrónico de Acceso (Usuario) *
              </label>
              <input
                type="email"
                [(ngModel)]="formData.admin_email"
                placeholder="admin@hotelsjb.com"
                class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Contraseña Maestra (Mínimo 8 caracteres) *
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <app-icon name="key" [size]="16"></app-icon>
                  </div>
                  <input
                    type="password"
                    [(ngModel)]="formData.admin_password"
                    placeholder="••••••••"
                    class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  PIN de Autorización Rápida (4 dígitos)
                </label>
                <input
                  type="password"
                  maxlength="4"
                  [(ngModel)]="formData.admin_pin"
                  placeholder="1234"
                  class="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-center tracking-widest font-mono"
                />
              </div>
            </div>

            <div class="p-4 rounded-xl bg-slate-900/60 border border-slate-700/40 text-xs text-slate-400 space-y-1">
              <div class="font-bold text-slate-300 flex items-center gap-1.5">
                <app-icon name="info" [size]="14" class="text-amber-400"></app-icon>
                Información de Despliegue:
              </div>
              <div>- El backend en Docker conectará con el MySQL nativo existente en su VPS.</div>
              <div>- Las tablas parametrizables de estados de habitación, limpieza y métodos de pago se crearán automáticamente.</div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between">
            <button
              *ngIf="step() > 1"
              type="button"
              (click)="prevStep()"
              class="px-5 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="chevron-left" [size]="16"></app-icon>
              Anterior
            </button>
            <div *ngIf="step() === 1"></div>

            <button
              *ngIf="step() < 3"
              type="button"
              (click)="nextStep()"
              class="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-sm font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              Siguiente
              <app-icon name="chevron-right" [size]="16"></app-icon>
            </button>

            <button
              *ngIf="step() === 3"
              type="button"
              [disabled]="loading()"
              (click)="submitSetup()"
              class="px-7 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <app-icon *ngIf="!loading()" name="check-circle" [size]="18"></app-icon>
              <span *ngIf="loading()">Inicializando...</span>
              <span *ngIf="!loading()">Finalizar e Iniciar Sistema</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SetupWizardComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private dialog = inject(DialogService);
  private router = inject(Router);

  step = signal<number>(1);
  loading = signal<boolean>(false);

  formData = {
    hotel_name: 'Hotel San Juan Bautista',
    trade_name: 'Inversiones Hoteleras SJB S.A.C.',
    tax_id: '20601234567',
    address: 'Av. El Sol 345, Cercado',
    city: 'Cusco',
    country: 'Perú',
    phone: '+51 84 234567',
    whatsapp: '+51 984123456',
    email: 'contacto@hotelsjb.com',
    logo_url: '',
    primary_currency: 'USD',
    currency_symbol: '$',
    tax_name: 'IGV',
    tax_percentage: 18.0,
    check_in_time: '14:00',
    check_out_time: '11:00',
    admin_name: 'Administrador Maestro',
    admin_email: 'admin@hotelsjb.com',
    admin_password: '',
    admin_pin: '1234'
  };

  currencyOptions: SelectOption[] = [
    { value: 'USD', label: 'Dólar Estadounidense (USD)', sublabel: 'Símbolo: $' },
    { value: 'PEN', label: 'Sol Peruano (PEN)', sublabel: 'Símbolo: S/' },
    { value: 'EUR', label: 'Euro (EUR)', sublabel: 'Símbolo: €' },
    { value: 'COP', label: 'Peso Colombiano (COP)', sublabel: 'Símbolo: $' },
    { value: 'MXN', label: 'Peso Mexicano (MXN)', sublabel: 'Símbolo: $' }
  ];

  onCurrencyChange(val: string) {
    if (val === 'PEN') this.formData.currency_symbol = 'S/';
    else if (val === 'EUR') this.formData.currency_symbol = '€';
    else this.formData.currency_symbol = '$';
  }

  nextStep() {
    if (this.step() === 1) {
      if (!this.formData.hotel_name.trim()) {
        this.toast.warning('Por favor ingrese el nombre del hotel');
        return;
      }
    } else if (this.step() === 2) {
      if (!this.formData.whatsapp.trim() || !this.formData.email.trim()) {
        this.toast.warning('El WhatsApp y correo oficial son obligatorios');
        return;
      }
    }
    this.step.update((s) => s + 1);
  }

  prevStep() {
    this.step.update((s) => s - 1);
  }

  async submitSetup() {
    if (!this.formData.admin_name.trim() || !this.formData.admin_email.trim()) {
      this.toast.warning('Complete los datos del superadministrador');
      return;
    }
    if (!this.formData.admin_password || this.formData.admin_password.length < 8) {
      this.toast.warning('La contraseña del superadministrador debe tener al menos 8 caracteres');
      return;
    }

    const confirmed = await this.dialog.confirm({
      title: 'Confirmar Inicialización',
      message: '¿Está seguro de inicializar el sistema con los datos proporcionados? Se creará la cuenta del Superadministrador.',
      type: 'info',
      confirmText: 'Sí, Inicializar'
    });

    if (!confirmed) return;

    this.loading.set(true);
    this.api.post('onboarding/initialize', this.formData).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        this.toast.success('El hotel ha sido configurado correctamente.', '¡Configuración Exitosa!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(
          err?.error?.message || 'Hubo un error al guardar la configuración inicial.',
          'Error en Inicialización'
        );
      }
    });
  }
}
