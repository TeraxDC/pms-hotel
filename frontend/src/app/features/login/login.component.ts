import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { CustomCheckboxComponent } from '../../shared/components/custom-checkbox/custom-checkbox.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, CustomCheckboxComponent],
  template: `
    <div class="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div class="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-25"></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-lg shadow-amber-500/10">
            <app-icon name="building" [size]="28"></app-icon>
          </div>
          <h2 class="text-2xl font-black text-white tracking-tight">
            Acceso al Sistema PMS
          </h2>
          <p class="mt-2 text-xs text-slate-400">
            Gestión hotelera, recepción y operaciones de alojamiento
          </p>
        </div>

        <div class="bg-slate-800/80 backdrop-blur-md border border-slate-700/60 rounded-3xl p-8 shadow-2xl text-slate-200">
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Correo Electrónico
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <app-icon name="user" [size]="16"></app-icon>
                </div>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="admin@hotelsjb.com"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Contraseña
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <app-icon name="key" [size]="16"></app-icon>
                </div>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
              </div>
            </div>

            <div class="flex items-center justify-between text-xs">
              <app-custom-checkbox [(ngModel)]="rememberMe" name="rememberMe">
                <span class="text-xs text-slate-300">Recordar sesión</span>
              </app-custom-checkbox>

              <a routerLink="/" class="text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Ir a Web Pública
              </a>
            </div>

            <button
              type="submit"
              [disabled]="loading()"
              class="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <app-icon *ngIf="!loading()" name="log-out" [size]="18" class="rotate-180"></app-icon>
              <span *ngIf="loading()">Autenticando...</span>
              <span *ngIf="!loading()">Iniciar Sesión</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email: string = 'admin@hotelsjb.com';
  password: string = '';
  rememberMe: boolean = true;
  loading = signal<boolean>(false);

  onSubmit() {
    if (!this.email.trim() || !this.password) {
      this.toast.warning('Por favor ingrese sus credenciales completas');
      return;
    }

    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.toast.success(`Bienvenido, ${res.user.full_name}`, 'Sesión Iniciada');
        this.router.navigate(['/pms/rack']);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.error(
          err?.error?.message || 'Usuario o contraseña incorrectos.',
          'Error de Acceso'
        );
      }
    });
  }
}
