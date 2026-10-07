import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-pms-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      <!-- DESKTOP SIDEBAR -->
      <aside class="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <!-- Brand Header -->
        <div class="h-20 flex items-center gap-3 px-6 border-b border-slate-800">
          <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
            <app-icon name="building" [size]="20"></app-icon>
          </div>
          <div>
            <span class="text-base font-extrabold text-white tracking-tight block">hotelSJB</span>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block">Suite Hotelera</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a
            routerLink="/pms/rack"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="bed" [size]="18"></app-icon>
            Rack de Habitaciones
          </a>

          <a
            routerLink="/pms/reservations"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="calendar" [size]="18"></app-icon>
            Reservas & Folios
          </a>

          <a
            routerLink="/pms/cash"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="dollar-sign" [size]="18"></app-icon>
            Caja Chica & Turnos
          </a>

          <a
            routerLink="/pms/housekeeping"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="sparkles" [size]="18"></app-icon>
            Housekeeping (Limpieza)
          </a>

          <a
            routerLink="/pms/reports"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="bar-chart" [size]="18"></app-icon>
            Reportes & Exportación
          </a>

          <div class="pt-4 pb-2">
            <span class="px-3.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configuración</span>
          </div>

          <a
            routerLink="/pms/users"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="users" [size]="18"></app-icon>
            Usuarios & Roles RBAC
          </a>

          <a
            routerLink="/pms/statuses"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="sliders" [size]="18"></app-icon>
            Estados & Colores HEX
          </a>

          <a
            routerLink="/pms/cms"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="edit" [size]="18"></app-icon>
            Editor Web (CMS)
          </a>

          <div class="pt-4 pb-2">
            <span class="px-3.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Acceso Público</span>
          </div>

          <a
            routerLink="/"
            target="_blank"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="chevron-right" [size]="16"></app-icon>
            Ver Portal Web
          </a>
        </nav>

        <!-- User Profile & Logout -->
        <div class="p-4 border-t border-slate-800">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5 truncate">
              <div class="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                <app-icon name="user" [size]="16"></app-icon>
              </div>
              <div class="truncate">
                <div class="text-xs font-bold text-white truncate">{{ auth.currentUser()?.full_name || 'Usuario' }}</div>
                <div class="text-[10px] text-slate-400 truncate">{{ auth.currentUser()?.role_display_name || 'Admin' }}</div>
              </div>
            </div>

            <button
              (click)="auth.logout()"
              class="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Cerrar Sesión"
            >
              <app-icon name="log-out" [size]="16"></app-icon>
            </button>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        <!-- TOP BAR -->
        <header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Sistema de Hospedaje</span>
            <span class="text-slate-300">•</span>
            <span class="text-xs font-semibold text-slate-600">Recepción & Operaciones</span>
          </div>

          <div class="flex items-center gap-4">
            <div class="text-right hidden sm:block">
              <span class="text-xs font-bold text-slate-800 block">{{ todayDate }}</span>
              <span class="text-[10px] text-emerald-600 font-semibold block">Sistema en Línea</span>
            </div>
          </div>
        </header>

        <!-- PAGE CONTENT ROUTER OUTLET -->
        <main class="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- MOBILE BOTTOM NAVIGATION BAR (PWA) -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-around py-2 px-3 shadow-xl">
        <a
          routerLink="/pms/rack"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="bed" [size]="20"></app-icon>
          <span>Rack</span>
        </a>

        <a
          routerLink="/pms/reservations"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="calendar" [size]="20"></app-icon>
          <span>Reservas</span>
        </a>

        <a
          routerLink="/pms/cash"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="dollar-sign" [size]="20"></app-icon>
          <span>Caja</span>
        </a>

        <a
          routerLink="/pms/housekeeping"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="sparkles" [size]="20"></app-icon>
          <span>Limpieza</span>
        </a>

        <button
          (click)="auth.logout()"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <app-icon name="log-out" [size]="20"></app-icon>
          <span>Salir</span>
        </button>
      </nav>

    </div>
  `
})
export class PmsLayoutComponent {
  auth = inject(AuthService);
  todayDate: string = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());
}
