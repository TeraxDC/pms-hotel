import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { FaviconService } from '../../core/services/favicon.service';
import { DialogService } from '../../shared/components/dialog/dialog.service';
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
          <img
            *ngIf="hotelSettings()?.logo_url"
            [src]="hotelSettings().logo_url"
            [alt]="hotelSettings()?.hotel_name || 'Logo'"
            class="h-10 max-w-[120px] object-contain rounded-lg"
          />
          <div
            *ngIf="!hotelSettings()?.logo_url"
            class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold"
          >
            <app-icon name="building" [size]="20"></app-icon>
          </div>
          <div class="overflow-hidden">
            <span class="text-base font-extrabold text-white tracking-tight block truncate">{{ hotelSettings()?.hotel_name || 'hotelSJB' }}</span>
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block truncate">{{ hotelSettings()?.trade_name || 'Suite Hotelera' }}</span>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <a
            *ngIf="auth.canAccess('rack')"
            routerLink="/pms/rack"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="bed" [size]="18"></app-icon>
            Rack de Habitaciones
          </a>

          <a
            *ngIf="auth.canAccess('rooms')"
            routerLink="/pms/rooms"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="layers" [size]="18"></app-icon>
            Habitaciones & Tarifas
          </a>

          <a
            *ngIf="auth.canAccess('reservations')"
            routerLink="/pms/reservations"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="calendar" [size]="18"></app-icon>
            Reservas & Folios
          </a>

          <a
            *ngIf="auth.canAccess('cash')"
            routerLink="/pms/cash"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="dollar-sign" [size]="18"></app-icon>
            Caja Chica & Turnos
          </a>

          <a
            *ngIf="auth.canAccess('housekeeping')"
            routerLink="/pms/housekeeping"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="sparkles" [size]="18"></app-icon>
            Housekeeping (Limpieza)
          </a>

          <a
            *ngIf="auth.canAccess('reports')"
            routerLink="/pms/reports"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="bar-chart" [size]="18"></app-icon>
            Reportes & Exportación
          </a>

          <!-- Configuración Group -->
          <div
            *ngIf="auth.canAccess('users') || auth.canAccess('statuses') || auth.canAccess('cms') || auth.canAccess('hotel_settings')"
            class="pt-4 pb-2"
          >
            <span class="px-3.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Configuración</span>
          </div>

          <a
            *ngIf="auth.canAccess('hotel_settings')"
            routerLink="/pms/hotel-info"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="building" [size]="18"></app-icon>
            <span>Información del Hospedaje</span>
            <span class="ml-auto px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">Superadmin</span>
          </a>

          <a
            *ngIf="auth.canAccess('users')"
            routerLink="/pms/users"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="users" [size]="18"></app-icon>
            Usuarios & Roles RBAC
          </a>

          <a
            *ngIf="auth.canAccess('statuses')"
            routerLink="/pms/statuses"
            routerLinkActive="bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
            class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <app-icon name="sliders" [size]="18"></app-icon>
            Estados & Colores HEX
          </a>

          <a
            *ngIf="auth.canAccess('cms')"
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

        <!-- System Status Footer -->
        <div class="px-6 py-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span class="truncate font-semibold">PMS Suite v1.0</span>
          <div class="flex items-center gap-1.5 text-emerald-500 font-bold">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px]">Activo</span>
          </div>
        </div>
      </aside>

      <!-- MAIN CONTENT WRAPPER -->
      <div class="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        
        <!-- TOP BAR -->
        <header class="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs relative z-30">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Sistema de Hospedaje</span>
            <span class="text-slate-300">•</span>
            <span class="text-[11px] sm:text-xs font-semibold text-slate-600 truncate">Recepción & Operaciones</span>
          </div>

          <div class="flex items-center gap-3 sm:gap-4">
            <!-- Date & Status Indicator (hidden on small screens) -->
            <div class="text-right hidden lg:block">
              <span class="text-xs font-bold text-slate-700 block capitalize">{{ todayDate }}</span>
              <span class="text-[10px] text-emerald-600 font-bold flex items-center justify-end gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Sistema en Línea
              </span>
            </div>

            <div class="h-8 w-px bg-slate-200 hidden lg:block"></div>

            <!-- Active User Menu in Top Navbar -->
            <div class="relative user-menu-container">
              <!-- Trigger Button -->
              <button
                type="button"
                (click)="toggleUserMenu()"
                class="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer select-none"
                [ngClass]="isUserMenuOpen() 
                  ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300 shadow-2xs'"
                title="Opciones de cuenta y sesión"
              >
                <!-- Avatar Icon -->
                <div
                  class="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                  [ngClass]="{
                    'bg-purple-100 text-purple-700 border border-purple-200': auth.currentUser()?.role === 'SUPERADMIN',
                    'bg-blue-100 text-blue-700 border border-blue-200': auth.currentUser()?.role === 'ADMIN',
                    'bg-amber-100 text-amber-700 border border-amber-200': auth.currentUser()?.role === 'RECEPTIONIST',
                    'bg-emerald-100 text-emerald-700 border border-emerald-200': auth.currentUser()?.role === 'HOUSEKEEPING'
                  }"
                >
                  <app-icon [name]="getRoleIcon(auth.currentUser()?.role)" [size]="16"></app-icon>
                </div>

                <!-- User Name & Role -->
                <div class="text-left hidden sm:block truncate max-w-[130px] md:max-w-[180px]">
                  <span class="text-xs font-extrabold text-slate-900 block truncate leading-tight">
                    {{ auth.currentUser()?.full_name || 'Usuario' }}
                  </span>
                  <span
                    class="text-[10px] font-bold tracking-wider uppercase block truncate"
                    [ngClass]="{
                      'text-purple-600': auth.currentUser()?.role === 'SUPERADMIN',
                      'text-blue-600': auth.currentUser()?.role === 'ADMIN',
                      'text-amber-600': auth.currentUser()?.role === 'RECEPTIONIST',
                      'text-emerald-600': auth.currentUser()?.role === 'HOUSEKEEPING'
                    }"
                  >
                    {{ auth.currentUser()?.role_display_name || auth.currentUser()?.role || 'Admin' }}
                  </span>
                </div>

                <!-- Dropdown Arrow -->
                <app-icon
                  name="chevron-down"
                  [size]="14"
                  class="text-slate-400 transition-transform duration-200 shrink-0 ml-0.5"
                  [class.rotate-180]="isUserMenuOpen()"
                ></app-icon>
              </button>

              <!-- Dropdown Menu -->
              <div
                *ngIf="isUserMenuOpen()"
                class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100 text-slate-800"
              >
                <!-- Dropdown User Info Card -->
                <div class="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/80">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs"
                    [ngClass]="{
                      'bg-purple-100 text-purple-700 border border-purple-200': auth.currentUser()?.role === 'SUPERADMIN',
                      'bg-blue-100 text-blue-700 border border-blue-200': auth.currentUser()?.role === 'ADMIN',
                      'bg-amber-100 text-amber-700 border border-amber-200': auth.currentUser()?.role === 'RECEPTIONIST',
                      'bg-emerald-100 text-emerald-700 border border-emerald-200': auth.currentUser()?.role === 'HOUSEKEEPING'
                    }"
                  >
                    <app-icon [name]="getRoleIcon(auth.currentUser()?.role)" [size]="20"></app-icon>
                  </div>
                  <div class="truncate">
                    <span class="text-xs font-black text-slate-900 block truncate leading-tight">
                      {{ auth.currentUser()?.full_name || 'Usuario' }}
                    </span>
                    <span class="text-[11px] text-slate-500 block truncate font-medium">
                      {{ auth.currentUser()?.email || 'Sin correo asignado' }}
                    </span>
                    <div class="mt-1 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      <span class="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Sesión Activa</span>
                    </div>
                  </div>
                </div>

                <!-- Menu Options -->
                <div class="p-1.5 space-y-1">
                  <!-- Option 1: Ver información del perfil -->
                  <button
                    type="button"
                    (click)="openProfileModal()"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer group text-left"
                  >
                    <div class="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-amber-100 group-hover:text-amber-700 text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                      <app-icon name="user" [size]="16"></app-icon>
                    </div>
                    <div class="flex-1 truncate">
                      <span class="block text-xs font-bold leading-tight">Ver Información del Perfil</span>
                      <span class="block text-[10px] font-medium text-slate-400">Datos del usuario y permisos</span>
                    </div>
                    <app-icon name="chevron-right" [size]="14" class="text-slate-300 group-hover:text-slate-500"></app-icon>
                  </button>

                  <!-- Option 2: Cerrar sesión -->
                  <button
                    type="button"
                    (click)="confirmLogout()"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer group text-left"
                  >
                    <div class="w-8 h-8 rounded-lg bg-red-50 group-hover:bg-red-100 text-red-600 flex items-center justify-center shrink-0 transition-colors">
                      <app-icon name="log-out" [size]="16"></app-icon>
                    </div>
                    <div class="flex-1 truncate">
                      <span class="block text-xs font-bold leading-tight">Cerrar Sesión</span>
                      <span class="block text-[10px] font-medium text-red-400">Finalizar turno en el PMS</span>
                    </div>
                  </button>
                </div>
              </div>
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
          *ngIf="auth.canAccess('rack')"
          routerLink="/pms/rack"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="bed" [size]="20"></app-icon>
          <span>Rack</span>
        </a>

        <a
          *ngIf="auth.canAccess('reservations')"
          routerLink="/pms/reservations"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="calendar" [size]="20"></app-icon>
          <span>Reservas</span>
        </a>

        <a
          *ngIf="auth.canAccess('cash')"
          routerLink="/pms/cash"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="dollar-sign" [size]="20"></app-icon>
          <span>Caja</span>
        </a>

        <a
          *ngIf="auth.canAccess('housekeeping')"
          routerLink="/pms/housekeeping"
          routerLinkActive="text-amber-400"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <app-icon name="sparkles" [size]="20"></app-icon>
          <span>Limpieza</span>
        </a>

        <button
          (click)="confirmLogout()"
          class="flex flex-col items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
        >
          <app-icon name="log-out" [size]="20"></app-icon>
          <span>Salir</span>
        </button>
      </nav>

      <!-- MODAL: INFORMACIÓN DEL PERFIL -->
      <div
        *ngIf="showProfileModal()"
        class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
        (click)="closeProfileModal()"
      >
        <div
          class="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
                <app-icon name="user" [size]="20"></app-icon>
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 leading-tight">Información del Perfil</h3>
                <p class="text-xs text-slate-500">Credenciales y privilegios de la sesión activa en el PMS</p>
              </div>
            </div>
            <button
              type="button"
              (click)="closeProfileModal()"
              class="w-8 h-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
              title="Cerrar modal"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-5">
            <!-- User Hero Card -->
            <div class="p-4 rounded-2xl bg-slate-900 text-white flex items-center gap-4 shadow-md relative overflow-hidden">
              <div class="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div
                class="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-md relative z-10"
                [ngClass]="{
                  'bg-purple-600 text-white': auth.currentUser()?.role === 'SUPERADMIN',
                  'bg-blue-600 text-white': auth.currentUser()?.role === 'ADMIN',
                  'bg-amber-500 text-slate-950': auth.currentUser()?.role === 'RECEPTIONIST',
                  'bg-emerald-600 text-white': auth.currentUser()?.role === 'HOUSEKEEPING'
                }"
              >
                <app-icon [name]="getRoleIcon(auth.currentUser()?.role)" [size]="28"></app-icon>
              </div>

              <div class="truncate relative z-10 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="text-base font-black text-white truncate leading-tight">
                    {{ auth.currentUser()?.full_name || 'Usuario' }}
                  </h4>
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                    [ngClass]="{
                      'bg-purple-500/20 text-purple-300 border border-purple-400/30': auth.currentUser()?.role === 'SUPERADMIN',
                      'bg-blue-500/20 text-blue-300 border border-blue-400/30': auth.currentUser()?.role === 'ADMIN',
                      'bg-amber-500/20 text-amber-300 border border-amber-400/30': auth.currentUser()?.role === 'RECEPTIONIST',
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30': auth.currentUser()?.role === 'HOUSEKEEPING'
                    }"
                  >
                    {{ auth.currentUser()?.role_display_name || auth.currentUser()?.role }}
                  </span>
                </div>
                <p class="text-xs text-slate-300 flex items-center gap-1.5 mt-1 truncate">
                  <app-icon name="mail" [size]="13" class="text-slate-400"></app-icon>
                  <span>{{ auth.currentUser()?.email || 'Sin correo asignado' }}</span>
                </p>
              </div>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Identificador de Usuario</span>
                <span class="font-mono font-bold text-slate-800 text-sm">#{{ auth.currentUser()?.id }}</span>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Estado de Sesión</span>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="font-bold text-emerald-700 text-xs">Conectado y Activo</span>
                </div>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hospedaje Vinculado</span>
                <span class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <app-icon name="building" [size]="14" class="text-amber-600"></app-icon>
                  {{ hotelSettings()?.hotel_name || 'hotelSJB' }} — {{ hotelSettings()?.trade_name || 'Suite Hotelera' }}
                </span>
              </div>

              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 col-span-2">
                <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Nivel de Acceso & Permisos</span>
                <div class="text-xs text-slate-700 mt-1">
                  <div *ngIf="auth.currentUser()?.role === 'SUPERADMIN'" class="flex items-center gap-1.5 font-bold text-purple-700">
                    <app-icon name="shield" [size]="14"></app-icon>
                    <span>Superadministrador: Acceso total al PMS, CMS, configuración de sistema y base de datos.</span>
                  </div>
                  <div *ngIf="auth.currentUser()?.role !== 'SUPERADMIN'" class="space-y-1">
                    <span class="font-medium text-slate-600">Módulos permitidos según rol:</span>
                    <div class="flex flex-wrap gap-1.5 pt-1">
                      <span *ngIf="auth.canAccess('rack')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Rack</span>
                      <span *ngIf="auth.canAccess('rooms')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Habitaciones</span>
                      <span *ngIf="auth.canAccess('reservations')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Reservas</span>
                      <span *ngIf="auth.canAccess('cash')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Caja Chica</span>
                      <span *ngIf="auth.canAccess('housekeeping')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Housekeeping</span>
                      <span *ngIf="auth.canAccess('reports')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Reportes</span>
                      <span *ngIf="auth.canAccess('users')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">Usuarios RBAC</span>
                      <span *ngIf="auth.canAccess('cms')" class="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-700">CMS Web</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              type="button"
              (click)="confirmLogout()"
              class="px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer"
            >
              <app-icon name="log-out" [size]="15"></app-icon>
              <span>Cerrar Sesión</span>
            </button>

            <button
              type="button"
              (click)="closeProfileModal()"
              class="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md shadow-slate-900/20 cursor-pointer"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>

    </div>
  `
})
export class PmsLayoutComponent implements OnInit {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private favicon = inject(FaviconService);
  private dialog = inject(DialogService);

  hotelSettings = signal<any>(null);
  isUserMenuOpen = signal<boolean>(false);
  showProfileModal = signal<boolean>(false);

  todayDate: string = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu-container')) {
      this.isUserMenuOpen.set(false);
    }
  }

  ngOnInit() {
    this.api.get<any>('onboarding/status').subscribe({
      next: (res) => {
        if (res.hotel) {
          this.hotelSettings.set(res.hotel);
          if (res.hotel.favicon_url) {
            this.favicon.setFavicon(res.hotel.favicon_url);
          }
        }
      },
      error: () => {}
    });
  }

  toggleUserMenu() {
    this.isUserMenuOpen.update((v) => !v);
  }

  closeUserMenu() {
    this.isUserMenuOpen.set(false);
  }

  openProfileModal() {
    this.closeUserMenu();
    this.showProfileModal.set(true);
  }

  closeProfileModal() {
    this.showProfileModal.set(false);
  }

  async confirmLogout() {
    this.closeUserMenu();
    const confirmed = await this.dialog.confirm({
      title: '¿Cerrar Sesión del PMS?',
      message: 'Está a punto de cerrar su sesión activa de recepción/administración. ¿Desea continuar y salir al portal de acceso?',
      type: 'warning',
      confirmText: 'Sí, Cerrar Sesión',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      if (this.showProfileModal()) {
        this.closeProfileModal();
      }
      this.auth.logout();
    }
  }

  getRoleIcon(role?: string): string {
    switch (role) {
      case 'SUPERADMIN': return 'shield';
      case 'ADMIN': return 'sliders';
      case 'RECEPTIONIST': return 'bed';
      case 'HOUSEKEEPING': return 'sparkles';
      default: return 'user';
    }
  }
}
